import { Component, OnInit, Input, inject, signal, computed } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/Api/api-service.service';
import { API_ENDPOINTS } from '../../shared/Api/api.constants';
import { catchError, of } from 'rxjs';

interface Section {
  id: number;
  name: string;
  informationSectionId: number;
  description?: string;
  statusId?: number | null;
  createdBy?: string;
  createdOn?: Date;
  modifiedBy?: string;
  modifiedOn?: Date;
}

export interface InformationResponse {
  id: number;
  informationId: number;
  response: string[];
  description: string;
  isMandatory: boolean;
  options: string;
  renderTypeId: number;
  renderTypeName: string;

  otherText?: string;
  comment?: string;
}

@Component({
  selector: 'app-clientquoestionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './clientquoestionnaire.component.html',
  styleUrl: './clientquoestionnaire.component.scss'
})
export class ClientquoestionnaireComponent implements OnInit {

  @Input() templateId!: number;
  @Input() clientId!: number;
  @Input() id!: number;

  private apiService = inject(ApiService);

  sections = signal<Section[]>([]);
  selectedSectionId = signal<number | null>(null);
  questions = signal<InformationResponse[]>([]);
  showLoader = signal(false);
  showUnsavedAlert = signal(false);
  responseChangeSignal = signal(0);

  pendingSectionId: number | null = null;
  hasSaved = signal(true);

  ngOnInit() {
    if (this.id) {
      this.loadSections(this.id);
    }
  }

  private loadSections(clientTemplateId: number): void {
    this.showLoader.set(true);
    this.apiService.get<any>(`${API_ENDPOINTS.GET_CLIENTTEMPLATEINFORMATIONSECTION}/${clientTemplateId}`)
      .pipe(
        catchError(err => {
          this.sections.set([]);
          this.showLoader.set(false);
          return of([]);
        })
      ).subscribe((response: any[]) => {
        const clientSections: Section[] = (response || []).map(section => ({
          id: section.id,
          name: section.name,
          description: section.description,
          informationSectionId: section.informationSectionId,
          statusId: section.statusId,
          modifiedBy: section.modifiedBy,
          modifiedOn: section.modifiedOn,
          createdBy: section.createdBy,
          createdOn: section.createdOn,
        }));
        this.sections.set(clientSections);

        if (clientSections.length > 0) {
          this.selectedSectionId.set(clientSections[0].id);
          this.loadSectionQuestions(clientSections[0].id);
        } else {
          this.showLoader.set(false);
        }
      });
  }

loadSectionQuestions(informationSectionId: number) {
    this.showLoader.set(true);
    this.apiService.get<any>(`${API_ENDPOINTS.GET_CLIENTINFORMATION}/${informationSectionId}`)
        .pipe(
            catchError(err => {
                this.showLoader.set(false);
                return of([]);
            })
        ).subscribe((response: any[]) => {
            const questionsList = response[0]?.informationResponses || [];
            const clientQuestions: InformationResponse[] = questionsList.map((q: any) => {
                let parsedResponse: any = q.response;
                let responseOptions: string[] = [];
                let otherTextValue: string = '';

                if (q.renderTypeName?.toLowerCase() === 'checkbox') {
                    try {
                        const parsed = JSON.parse(parsedResponse);
                        if (parsed && Array.isArray(parsed.options)) {
                            responseOptions = parsed.options;
                            if (parsed.related?.name === 'Other' && parsed.related?.value) {
                                otherTextValue = parsed.related.value;
                            }
                        }
                    } catch {
                        responseOptions = Array.isArray(parsedResponse) ? parsedResponse : [];
                    }
                }

                return {
                    id: q.id,
                    informationId: q.informationId,
                    response: q.renderTypeName?.toLowerCase() === 'checkbox' ? responseOptions : q.response,
                    description: q.description,
                    isMandatory: q.isMandatory,
                    options: q.options,
                    renderTypeId: q.renderTypeId,
                    renderTypeName: q.renderTypeName,
                    otherText: otherTextValue,
                    comment: q.comment?.trim() || ''
                };
            });

            this.questions.set(clientQuestions);
            this.showLoader.set(false);
        });
}


private parseCheckboxResponse(response: any): string[] {
    if (!response) return [];

    try {
        const parsed = JSON.parse(response);
        if (parsed && Array.isArray(parsed.options)) {
            // Also restore the Other text if available
            if (parsed.related?.name === 'Other' && parsed.related?.value) {
                this.restoreOtherText(parsed.options, parsed.related.value);
            }
            return parsed.options;
        }
    } catch {
        if (Array.isArray(response)) return response;
    }

    return [];
}

private restoreOtherText(options: string[], otherValue: string) {
    // Find the question and set its otherText based on selected options
    this.questions.update(qs =>
        qs.map(q => {
            if (q.renderTypeName.toLowerCase() === 'checkbox' && options.includes('Other')) {
                q.otherText = otherValue;
            }
            return q;
        })
    );
}



  onAnswerChange() {
    this.questions.set([...this.questions()]);
    this.responseChangeSignal.update(v => v + 1);
    this.hasSaved.set(false);
  }

  getOptionsArray(options: string | undefined): string[] {
      if (!options) return [];
      try {
          return JSON.parse(options.replace(/'/g, '"'));
      } catch {
          return [];
      }
  }

  
  onCheckboxChange(
    question: InformationResponse,
    option: string,
    event: Event
  ) {
    const input = event.target as HTMLInputElement;

    if (!Array.isArray(question.response)) {    // always work with an array
      question.response = [];
    }

    if (input.checked) {
      if (!question.response.includes(option)) {
        question.response.push(option);
      }
    } else {
      question.response = question.response.filter(o => o !== option);

      if (option === 'Other') {       // clear the free‑text if “Other” has been unticked
        question.otherText = '';
      }
    }
    this.onAnswerChange();
  }


saveSection() {
    const currentSectionId = this.selectedSectionId();

    const answers = this.questions()
        .filter(q => q.response !== null && q.response !== undefined && `${q.response}`.trim() !== '')
        .map(q => {
            let formattedResponse: any = q.response;

            if (q.renderTypeName.toLowerCase() === 'checkbox') {
                if (Array.isArray(q.response)) {
                    formattedResponse = {
                        options: q.response
                    };

                    if (q.response.includes('Other')) {
                        formattedResponse.related = {
                            name: 'Other',
                            value: q.otherText?.trim() || ''
                        };
                    }
                } else if (typeof q.response === 'string') {
                    try {
                        formattedResponse = JSON.parse(q.response);
                    } catch {
                        formattedResponse = q.response;
                    }
                }
                // Always stringify for checkbox answers
                formattedResponse = JSON.stringify(formattedResponse);
            }

            return {
                id: q.id,
                response: formattedResponse,
                comment: q.comment?.trim() || ''
            };
        });

    if (answers.length === 0) {
        alert('No answers to save.');
        return;
    }

    this.apiService.post('/v1/clientInformation', answers).subscribe({
        next: () => {
            alert('Saved successfully');
            this.hasSaved.set(true);
            if (currentSectionId !== null) {
                this.loadSectionQuestions(currentSectionId);
            }
        },
        error: err => {
            console.error('Save failed', err);
            alert('Failed to save answers. Please try again.');
        }
    });
}


  isSaveEnabled = computed(() =>
    this.questions().some(q =>
      q.response !== null &&
      q.response !== undefined &&
      `${q.response}`.trim() !== ''
    )
  );

  hasUnsavedChanges(): boolean {
    const hasAnyAnswer = this.questions().some(q =>
      q.response !== null &&
      q.response !== undefined &&
      `${q.response}`.trim() !== ''
    );
    return hasAnyAnswer && !this.hasSaved();
  }

  triggerSectionChange(sectionId: number) {
    if (this.selectedSectionId() === sectionId) return;

    if (this.hasUnsavedChanges()) {
      this.pendingSectionId = sectionId;
      this.showUnsavedAlert.set(true);
    } else {
      this.performSectionChange(sectionId);
    }
  }

  performSectionChange(sectionId: number) {
    this.selectedSectionId.set(sectionId);
    this.hasSaved.set(true);
    this.loadSectionQuestions(sectionId);
  }

  confirmUnsavedAlert() {
    this.showUnsavedAlert.set(false);
    this.hasSaved.set(true);
    if (this.pendingSectionId !== null) {
      this.performSectionChange(this.pendingSectionId);
      this.pendingSectionId = null;
    }
  }

  closeUnsavedAlert() {
    this.showUnsavedAlert.set(false);
    this.pendingSectionId = null;
  }

  prev() {
    const index = this.sections().findIndex(s => s.informationSectionId === this.selectedSectionId());
    if (index > 0) {
      this.triggerSectionChange(this.sections()[index - 1].informationSectionId);
    }
  }

  next() {
    const index = this.sections().findIndex(s => s.informationSectionId === this.selectedSectionId());
    if (index < this.sections().length - 1) {
      this.triggerSectionChange(this.sections()[index + 1].informationSectionId);
    }
  }

  isFirst(): boolean {
    return this.sections().findIndex(s => s.informationSectionId === this.selectedSectionId()) === 0;
  }

  isLast(): boolean {
    return this.sections().findIndex(s => s.informationSectionId === this.selectedSectionId()) === this.sections().length - 1;
  }
}
