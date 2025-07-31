import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Template {
  id: string;
  name: string;
  questions: string[];
}
interface Client {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, FormsModule, CommonModule
  ],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.scss'
})
export class UserModalComponent {
  templates: Template[] = [
    {
      id: '1',
      name: 'Onboarding',
      questions: ['What is your department?', 'Do you need admin access?']
    },
    {
      id: '2',
      name: 'Offboarding',
      questions: ['What is the last working day?', 'Do you need data backup?']
    }
  ];

  clients: Client[] = [
    { id: 'client1', name: 'Acme Corp' },
    { id: 'client2', name: 'Globex Inc' }
  ];

  selectedTemplateId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<UserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSave() { this.dialogRef.close(this.data); }
  onCancel() { this.dialogRef.close(); }

  onTemplateChange(templateId: string) {
    this.selectedTemplateId = templateId;
    this.data.templateId = templateId;
  }

  previewTemplate(event: MouseEvent) {
    event.stopPropagation();
    const template = this.templates.find(t => t.id === this.selectedTemplateId);
    if (!template) return;
    const questionCount = template.questions.length;

    const html = `
      <html>
        <head>
          <title>Template Preview - ${template.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              background: #f6f8fa;
              font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
              color: #222a35;
            }
            body {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .header {
              padding: 0.7rem 1.5rem 0.7rem 1.5rem;
              font-size: 1.15rem;
              font-weight: 700;
              color: #1a2a42;
              background: #fff;
              border-bottom: 1px solid #e2e6ee;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: sticky;
              top: 0;
              z-index: 10;
              min-height: 2.5rem;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 0.6rem;
            }
            .header .fa-layer-group {
              color: rgb(25, 118, 210);
              font-size: 1.15rem;
            }
            .question-count {
              font-size: 1rem;
              font-weight: 500;
              color: #1976d2;
              background: #e3f0fb;
              border-radius: 1.2em;
              padding: 0.2em 0.9em;
              margin-left: 1.5em;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
              gap: 0.4em;
            }
            .question-count i {
              font-size: 1em;
              color: #1976d2;
              margin-right: 0.3em;
            }
            .main {
              flex: 1;
              padding: 1.5rem;
              max-width: 900px;
              background: transparent;
              overflow-y: auto;
            }
            .questions-list {
              margin: 0;
              padding: 0;
              list-style: none;
            }
            .question-row {
              display: flex;
              align-items: flex-start;
              gap: 0.5rem;
              padding: 0.7rem 0;
              border-bottom: 1px solid #e6eaeF;
              font-size: 1.01rem;
              color: #263047;
              background: none;
            }
            .question-row:last-child {
              border-bottom: none;
            }
            .question-row i {
              color: rgb(25, 118, 210);
              font-size: 1.08rem;
              margin-top: 0.15rem;
              flex-shrink: 0;
            }
            .question-row span {
              display: block;
              text-align: left;
              word-break: break-word;
              flex: 1;
            }
            @media (max-width: 700px) {
              .header { padding: 0.6rem 0.6rem 0.6rem 0.6rem; font-size: 1rem; min-height: 2rem;}
              .main { padding: 1rem 0.4rem;}
              .question-row { font-size: 0.97rem; }
              .question-count { font-size: 0.94rem; padding: 0.2em 0.7em;}
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <i class="fa-solid fa-layer-group"></i>
              <span>${template.name}</span>
            </div>
            <div class="question-count" title="Total Questions">
               <span>Number Of Quoestions:</span>
              ${questionCount}
            </div>
          </div>
          <div class="main">
            <ul class="questions-list">
              ${template.questions.map(q => `
                <li class="question-row">
                  <i class="fa-regular fa-circle-question"></i>
                  <span>${q}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </body>
      </html>
    `;

    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  }
}