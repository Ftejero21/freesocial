import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Task } from 'src/app/Interface/Task';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {

  public task: Task = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIA'
  };
  @Output() taskCreated = new EventEmitter<Task>();  // Emitir la tarea creada al componente padre

  @ViewChild('taskModal') taskModal!: ElementRef;
  constructor() { }

  ngOnInit(): void {
  }


   // Método para abrir el modal con los datos de la tarea seleccionada
   openModalWithTask(task: Task): void {
      this.task = { ...task };
      const modalElement = document.getElementById('taskModal');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.setAttribute('style', 'display: block');
        modalElement.setAttribute('aria-modal', 'true');
      }
    }

    selectPriority(priority: string) {
      this.task.priority = priority;
    }

    // Guardar la tarea
    saveTask(): void {
      this.taskCreated.emit(this.task);
      this.closeModal();
      this.resetForm();
    }


    closeModal(): void {
    this.resetForm();
    const modalElement = this.taskModal.nativeElement;
    modalElement.classList.remove('show');  // Remover la clase "show"
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.setAttribute('style', 'display: none;');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();  // Remover el backdrop si existe
    }
    }

    // Resetear el formulario
    resetForm(): void {
      this.task = {
        title: '',
        description: '',
        dueDate: '',
        priority: 'MEDIA'
      };
    }

}
