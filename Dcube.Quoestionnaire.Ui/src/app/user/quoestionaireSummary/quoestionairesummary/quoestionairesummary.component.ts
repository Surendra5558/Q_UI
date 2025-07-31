import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { QuestionnaireComponent } from "../../questionnaire/questionnaire.component";
import { ClientdetailsComponent } from "../../../admin/client-details/clientdetails/clientdetails.component";
import { ActivatedRoute } from '@angular/router';
import { PathwaymaturityComponent } from "../../pathwaymaturity/pathwaymaturity.component";
import { ClientquoestionnaireComponent } from "../../clientquoestionnaire/clientquoestionnaire.component";

@Component({
  selector: 'app-awesome-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, QuestionnaireComponent, ClientdetailsComponent, PathwaymaturityComponent, ClientquoestionnaireComponent],
  templateUrl: './quoestionairesummary.component.html',
  styleUrl: './quoestionairesummary.component.scss'
})
export class QuoestionairesummaryComponent {
  id!: number;
  templateId!: number;
  clientId!: number;
  selectedIndex: any = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.id = Number(params.get('id'));
      this.templateId = Number(params.get('templateId'));
      this.clientId = Number(params.get('clientId'));

      // Optional: validate
      if (!this.id || !this.templateId || !this.clientId) {
        // handle missing parameters
        console.error('Missing templateId or clientId');
      }
    });
  }
}