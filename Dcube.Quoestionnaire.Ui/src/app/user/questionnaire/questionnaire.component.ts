import { Component, OnInit, signal, computed, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ApiService } from '../../shared/Api/api-service.service';
import { API_ENDPOINTS } from '../../shared/Api/api.constants';
import { MatCardModule } from '@angular/material/card';

interface Section {
  templateSectionId: number;
  templateSectionName: string;
  templateSectionDescription: string;
  parentTemplateSectionId: number | null;
  statusId?: number | null;
  id: number;
  childSections?: ChildSectionWithQuestionnaires[];
  saved?: boolean;
}

interface ChildSection {
  templateSectionId: number;
  templateSectionName: string;
  templateSectionDescription: string;
  parentTemplateSectionId: number | null;
  id: number;
  statusId?: number | null;
  statusName?: string;
}

interface QuestionnaireResponse {
  sectionDescription: string;
  clientQuestionnaireResponseId: number;
  response: string | null;
  questionnaireId: number;
  description: string;
  renderTypeId: number;
  renderTypeName: string;
  isMandatory: boolean;
  options: string;
  id: number;
  comments?: string | null;
}

interface SectionQuestionnaireResponse {
  questionnaireResponses: QuestionnaireResponse[];
  sectionName: string;
}
interface ChildSectionWithQuestionnaires extends ChildSection {
  questionnaires?: QuestionnaireResponse[];
  statusId?: number | null;
}

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, CommonModule, MatCardModule],
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {
  @Input() templateId!: number;
  @Input() clientId!: number;
  @Input() id!: number;
  private auth = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);


  sections = signal<Section[]>([]);
  selectedParentSectionId = signal<number | null>(null);
  childSections = signal<ChildSectionWithQuestionnaires[]>([]);
  selectedChildSectionId = signal<number | null>(null);

  previewMode = signal(false);
  showLoader = signal(true);

  selectedParentSectionName: string = '';
  selectedChildSectionName: string = '';
  selectedStatus: string = '';
  selectedScore: number = 0;
  selectedPercentage: number = 0;

  selectedParentStatus: string = '';
  selectedParentScore: number = 0;
  selectedParentPercentage: number = 0;
  // For save state
  private originalResponses: { [key: number]: any } = {};

  // Signal to track response changes so computed re-evaluates
  private responseChangeSignal = signal(0);

  // For unsaved changes alert
  showUnsavedAlert = signal(false);
  private pendingSectionSwitch: { parentSectionId: number | null, childId: number | null } | null = null;

  ngOnInit(): void {
    if (!this.id) {
      this.showLoader.set(false);
      return;
    }
    this.loadSections(this.id);
  }

  private loadSections(clientTemplateId: number): void {
    this.showLoader.set(true);
    this.apiService.get<any>(`${API_ENDPOINTS.GET_CLIENTTEMPLATESECTION}/${clientTemplateId}`)
      .pipe(
        catchError(err => {
          this.sections.set([]);
          this.showLoader.set(false);
          return of([]);
        })
      ).subscribe((sectionsResponse: any[]) => {
        const allSections: Section[] = (sectionsResponse || []).map((section: any) => ({
          templateSectionId: section.templateSectionId ?? section.id,
          templateSectionName: section.templateSectionName ?? section.name ?? '',
          templateSectionDescription: section.templateSectionDescription ?? section.description ?? '',
          parentTemplateSectionId: section.parentTemplateSectionId ?? null,
          statusId: section.statusId ?? null,
          score: section.score ?? 0,
          percentage: section.percentage ?? 0,
          statusName: section.statusName ?? '',
          id: section.id,
        }));

        const parentSections = allSections.filter(s => s.parentTemplateSectionId == null);
        this.sections.set(parentSections);

        if (parentSections.length > 0) {
          this.onParentSectionClick(parentSections[0].templateSectionId, true);
        }
        this.showLoader.set(false);
      });
  }

  private cloneResponses(arr: QuestionnaireResponse[] = []) {
    return arr.map(q => ({ ...q }));
  }

  private storeOriginalResponses(childId: number, questionnaires: QuestionnaireResponse[]) {
    this.originalResponses[childId] = this.cloneResponses(questionnaires);
  }

  private hasUnsavedChanges(child: ChildSectionWithQuestionnaires): boolean {
    if (!child || !child.questionnaires) return false;
    const original = this.originalResponses[child.id] || [];
    return child.questionnaires.some((q, idx) => {
      const current = q.response ?? '';
      const prev = (original[idx]?.response ?? '');
      return current !== prev;
    });
  }

  private allQuestionsFilled(child: ChildSectionWithQuestionnaires): boolean {
    if (!child || !child.questionnaires) return false;
    return child.questionnaires.length > 0 &&
      child.questionnaires.every(q => (q.response ?? '') !== '');
  }

  // Save button enabled only if all questions answered and there are unsaved changes
  isSaveEnabled = computed(() => {
    this.responseChangeSignal();  // track changes for reactivity
    const child = this.childSections().find(c => c.id === this.selectedChildSectionId());
    return !!child && this.allQuestionsFilled(child) && this.hasUnsavedChanges(child);
  });

  onParentSectionClick(parentSectionId: number, forceSwitch = false) {
    if (this.selectedParentSectionId() === parentSectionId && !forceSwitch) {
      this.selectedParentSectionId.set(null);
      this.childSections.set([]);
      this.selectedChildSectionId.set(null);
      return;
    }
    if (!forceSwitch && this.hasUnsavedWork()) {
      this.pendingSectionSwitch = { parentSectionId, childId: null };
      this.showUnsavedAlert.set(true);
      return;
    }

    this.selectedParentSectionId.set(parentSectionId);
    this.showLoader.set(true);
    const clientTemplateId = this.id;
    if (!clientTemplateId) {
      this.childSections.set([]);
      this.selectedChildSectionId.set(null);
      this.showLoader.set(false);
      return;
    }
    this.apiService.get<any>(`${API_ENDPOINTS.GET_CLIENTTEMPLATESECTION}/${clientTemplateId}`)
      .pipe(
        catchError(() => of([]))
      )
      .subscribe((sectionsResponse: any[]) => {
        const childSections: ChildSection[] = (sectionsResponse || [])
          .filter((s: any) => s.parentTemplateSectionId === parentSectionId)
          .map((s: any) => ({
            templateSectionId: s.templateSectionId ?? s.id,
            templateSectionName: s.templateSectionName ?? s.name ?? '',
            templateSectionDescription: s.templateSectionDescription ?? s.description ?? '',
            parentTemplateSectionId: s.parentTemplateSectionId ?? null,
            statusId: s.statusId ?? null,
            score: s.score ?? 0,
            percentage: s.percentage ?? 0,
            statusName: s.statusName ?? '',
            id: s.id
          }));

        if (childSections.length === 0) {
          this.childSections.set([]);
          this.selectedChildSectionId.set(null);
          this.showLoader.set(false);
          return;
        }

        forkJoin(
          childSections.map(child =>
            this.apiService.get<SectionQuestionnaireResponse>(
              `${API_ENDPOINTS.GET_CLIENTQUOESTIONAIRES}/${child.id}`
            ).pipe(
              catchError(() => of({ questionnaireResponses: [], sectionName: child.templateSectionName }))
            )
          )
        ).subscribe((results: SectionQuestionnaireResponse[]) => {
          const childrenWithQ: ChildSectionWithQuestionnaires[] = childSections.map((child, idx) => ({
            ...child,
            questionnaires: results[idx]?.questionnaireResponses || []
          }));

          this.childSections.set(childrenWithQ);
          this.selectedChildSectionId.set(childrenWithQ[0]?.id ?? null);

          // Store original responses for the selected child
          const selectedChild = childrenWithQ[0];
          if (selectedChild) this.storeOriginalResponses(selectedChild.id, selectedChild.questionnaires!);

          this.showLoader.set(false);
        });
      });
  }

  onChildSectionClick(childId: number, forceSwitch = false) {
    if (this.selectedChildSectionId() === childId && !forceSwitch) return;
    if (!forceSwitch && this.hasUnsavedWork()) {
      this.pendingSectionSwitch = { parentSectionId: null, childId };
      this.showUnsavedAlert.set(true);
      return;
    }
    this.selectedChildSectionId.set(childId);
    const child = this.childSections().find(c => c.id === childId);
  }

  hasUnsavedWork(): boolean {
    const child = this.childSections().find(c => c.id === this.selectedChildSectionId());
    return !!child && this.hasUnsavedChanges(child);
  }

  filteredQuestions = computed(() => {
    const selectedChild = this.childSections().find(c => c.id === this.selectedChildSectionId());
    return selectedChild?.questionnaires ?? [];
  });

  getOptionsArray(options: string | undefined): string[] {
    if (!options) return [];
    try {
      return options.replace(/\[|\]/g, '').split(',').map(v => v.trim()).filter(v => v.length > 0);
    } catch {
      return [];
    }
  }

  getCurrentParentChildIndex() {
    const pIdx = this.sections().findIndex(s => s.templateSectionId === this.selectedParentSectionId());
    const cIdx = this.childSections().findIndex(c => c.id === this.selectedChildSectionId());
    const curSec = this.sections().find(s => s.templateSectionId === this.selectedParentSectionId());
    const curChild = this.childSections().find(c => c.id === this.selectedChildSectionId());
    this.selectedParentSectionName = curSec?.templateSectionName ?? '';
    this.selectedChildSectionName = curChild?.templateSectionName ?? '';
    this.setParentStats(curSec);
    this.setChildStats(curChild);
    return { pIdx, cIdx };
  }

  prev() {
    const { pIdx, cIdx } = this.getCurrentParentChildIndex();
    if (cIdx > 0) {
      this.onChildSectionClick(this.childSections()[cIdx - 1].id);
    } else if (pIdx > 0) {
      this.onParentSectionClick(this.sections()[pIdx - 1].templateSectionId);
      setTimeout(() => {
        const children = this.childSections();
        if (children.length) this.onChildSectionClick(children[children.length - 1].id, true);
      }, 350);
    }
  }

  next() {
    const { pIdx, cIdx } = this.getCurrentParentChildIndex();
    if (cIdx < this.childSections().length - 1) {
      this.onChildSectionClick(this.childSections()[cIdx + 1].id);
    } else if (pIdx < this.sections().length - 1) {
      this.onParentSectionClick(this.sections()[pIdx + 1].templateSectionId);
      setTimeout(() => {
        const children = this.childSections();
        if (children.length) this.onChildSectionClick(children[0].id, true);
      }, 350);
    }
  }

  isFirst(): boolean {
    const { pIdx, cIdx } = this.getCurrentParentChildIndex();
    return pIdx === 0 && cIdx === 0;
  }
  isLast(): boolean {
    const { pIdx, cIdx } = this.getCurrentParentChildIndex();
    return (pIdx === this.sections().length - 1) && (cIdx === this.childSections().length - 1);
  }

  saveSection() {
    // Separate children by status
    const alreadyFilledChildren = this.childSections().filter(c => c.statusId === 3 && c.id === this.selectedChildSectionId());
    const notFilledChildren = this.childSections().filter(c => c.statusId !== 3);

    const answersToSubmit: any[] = [];

    // For already filled children, send only changed questionnaire responses
    alreadyFilledChildren.forEach(child => {
      if (!child.questionnaires) return;
      const original = this.originalResponses[child.id] || [];

      child.questionnaires.forEach(q => {
        // Find original response by matching questionnaireId, not index
        const originalQ = original.find((o: QuestionnaireResponse) => o.questionnaireId === q.questionnaireId);
        const originalResponse = originalQ ? (originalQ.response ?? '') : '';
        const currentResponse = q.response ?? '';

        if (currentResponse !== originalResponse) {
          answersToSubmit.push({
            id: q.questionnaireId,
            response: currentResponse,
            comments: q.comments ?? ''
          });
        }
      });
    });

    // For children not filled yet, send all questionnaire responses that are non-empty
    const selectedSectionId = this.selectedChildSectionId()// Adjust index if we have already filled children
    notFilledChildren.forEach((child) => {
      if (child.id !== selectedSectionId)
        return; // Skip if not the currently selected child
      child.questionnaires?.forEach(q => {
        if ((q.response ?? '') !== '') {
          answersToSubmit.push({
            id: q.questionnaireId,
            response: q.response,
            comments: q.comments ?? ''
          });
        }
      });
    });

    const currentSection = this.sections().find(s => s.templateSectionId === this.selectedParentSectionId());
    if (!currentSection) return;

    if (answersToSubmit.length === 0) {
      alert('No changes to save.');
      return;
    }

    this.apiService.post('/v1/ClientSectionQuestionnaire', answersToSubmit).subscribe({
      next: () => {
        // Update original responses after save for all children (both groups)
        this.childSections().forEach(child => {
          if (child.questionnaires) {
            this.storeOriginalResponses(child.id, child.questionnaires);
          }
        });

        // Mark section saved visually
        this.sections.update(sections => {
          const updated = [...sections];
          const idx = updated.findIndex(s => s.templateSectionId === currentSection.templateSectionId);
          if (idx !== -1) updated[idx] = { ...updated[idx], saved: true };
          return updated;
        });

        alert('Section saved!');

        // Fetch and update stats after save
        this.updateStatsAfterSave();
      },
      error: () => {
        alert('Error saving section');
      }
    });
  }

  private updateStatsAfterSave() {
    const parentId = this.selectedParentSectionId();
    const childId = this.selectedChildSectionId();
    const clientTemplateId = this.id;
    if (!clientTemplateId || !parentId || !childId) return;

    // Example API call to get updated stats for the child section
    this.apiService.get<any>(`${API_ENDPOINTS.GET_CLIENTTEMPLATESECTION}/${clientTemplateId}`)
      .pipe(catchError(() => of([])))
      .subscribe((sectionsResponse: any[]) => {
        // Find the updated parent and child section
        const updatedParent = (sectionsResponse || []).find((s: any) => s.templateSectionId === parentId);
        const updatedChild = (sectionsResponse || []).find((s: any) => s.id === childId);

        // Update parent stats
        if (updatedParent) {
          this.setParentStats(updatedParent);
        }
        // Update child stats
        if (updatedChild) {
          this.setChildStats(updatedChild);
        }
      });
  }

  preview() {
    this.previewMode.set(true);
  }

  exitPreview() {
    this.previewMode.set(false);
  }

  allQuestionsAnswered(child: ChildSectionWithQuestionnaires): boolean {
    const questions = child.questionnaires ?? [];
    return questions.length > 0 && questions.every((q: QuestionnaireResponse) => (q.response ?? '') !== '');
  }

  allSectionsWithAnswers = computed(() => {
    return this.sections().map(parent => {
      let children: ChildSectionWithQuestionnaires[] = [];
      if (parent.templateSectionId === this.selectedParentSectionId()) {
        children = this.childSections();
      }
      return {
        parent,
        children
      };
    });
  });

  confirmUnsavedAlert() {
    this.showUnsavedAlert.set(false);
    if (this.pendingSectionSwitch) {
      // Restore only changed answers to their original state
      const childId = this.selectedChildSectionId();
      if (childId) {
        const child = this.childSections().find(c => c.id === childId);
        if (child && child.questionnaires) {
          const original = this.originalResponses[child.id] || [];
          child.questionnaires.forEach(q => {
            const originalQ = original.find((o: QuestionnaireResponse) => o.questionnaireId === q.questionnaireId);
            if (originalQ) {
              q.response = originalQ.response;
            }
          });
          this.storeOriginalResponses(child.id, child.questionnaires);
        }
      }

      // Perform the pending section switch
      if (this.pendingSectionSwitch.parentSectionId !== null) {
        this.onParentSectionClick(this.pendingSectionSwitch.parentSectionId, true);
      } else if (this.pendingSectionSwitch.childId !== null) {
        this.onChildSectionClick(this.pendingSectionSwitch.childId, true);
      }

      this.pendingSectionSwitch = null;
    }
  }

  closeUnsavedAlert() {
    this.showUnsavedAlert.set(false);
    this.pendingSectionSwitch = null;
  }

  // NEW METHOD to call on answer change for reactivity
  onAnswerChange() {
    this.responseChangeSignal.update(n => n + 1);
  }

  getColor(percentage: number): string {
    if (percentage > 90) return 'green';
    if (percentage >= 40 && percentage <= 90) return 'orange';
    return 'red';
  }

  setChildStats(child: ChildSectionWithQuestionnaires | undefined) {
    if (child) {
      this.selectedStatus = child.statusName ?? '';
      this.selectedScore = (child as any).score ?? 0; // Assuming score is a property of ChildSectionWithQuestionnaires
      this.selectedPercentage = (child as any).percentage ?? 0; // Assuming percentage is a property of ChildSectionWithQuestionnaires
    }
  }
  setParentStats(parent: any) {
    if (parent) {
      this.selectedParentStatus = parent.statusName ?? '';
      this.selectedParentScore = (parent as any).score ?? 0; // Assuming score is a property of ChildSectionWithQuestionnaires
      this.selectedParentPercentage = (parent as any).percentage ?? 0; // Assuming percentage is a property of ChildSectionWithQuestionnaires
    }
  }
}
