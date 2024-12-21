import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskModalComponent } from 'src/app/ComponentesReutilizables/task-modal/task-modal.component';
import { Task } from 'src/app/Interface/Task';
import { TaskServiceService } from 'src/app/Service/TaskService/task-service.service';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit {

  public tasks: Task[] = [];
  draggedTask: any = null;
  draggingSection: string | null = null;
  selectedTask: any = null;
  selectedTask2: Task | null = null;  // Tarea seleccionada

  constructor(private taskService: TaskServiceService) { }

  @ViewChild('taskModal') taskModal!: TaskModalComponent;  // Referencia al componente del modal



  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasksForLoggedUser().subscribe(
      (data: Task[]) => {
        this.tasks = data;
      },
      error => {
        console.error('Error al cargar las tareas', error);
      }
    );
  }


  getTasksByPriority(priority: string): Task[] {
    return this.tasks.filter(task => task.priority.toLowerCase() === priority.toLowerCase());
  }

  onDragStart(event:any, task:any) {
    this.draggedTask = task;
  }

  // Permitir que las tareas sean soltadas en las otras secciones
  allowDrop(event:any) {
    event.preventDefault();
  }

  // Resaltar la sección cuando la tarea entra
  onDragEnter(section: string) {
    this.draggingSection = section;
  }

  // Eliminar el resaltado cuando la tarea sale de la sección
  onDragLeave() {
    this.draggingSection = null;
  }



  // Evento cuando se suelta la tarea en una nueva sección
  onDrop(event: any, newPriority: string) {
    event.preventDefault();
    if (this.draggedTask) {
      // Cambiar la prioridad de la tarea
      this.draggedTask.priority = newPriority;

      // Llamar a saveOrUpdate para actualizar la tarea en el backend
      this.taskService.saveOrUpdate(this.draggedTask).subscribe(
        error => {
          console.error('Error al actualizar la tarea', error);
        }
      );

      // Limpiar el estado del arrastre
      this.draggedTask = null;
      this.draggingSection = null;
    }
  }

  // Método para manejar la tarea creada desde el modal
  onTaskCreated(task: Task): void {
    this.taskService.saveOrUpdate(task).subscribe(
      response => {
        this.loadTasks();  // Recargar las tareas después de crear una nueva
      },
      error => {
        console.error('Error al guardar la tarea', error);
      }
    );
  }

  openEditModal(task: Task): void {
    this.selectedTask2 = task;
    this.taskModal.openModalWithTask(this.selectedTask2);  // Abre el modal y pasa los datos de la tarea seleccionada
  }

  updateTask(modal:any) {
    const index = this.tasks.findIndex(t => t.title === this.selectedTask.title && t.dueDate === this.selectedTask.dueDate);
    if (index !== -1) {
      this.tasks[index] = { ...this.selectedTask }; // Actualizar la tarea con los nuevos datos
    }
    modal.dismiss(); // Cerrar el modal
  }

  stopPropagation(event:any) {
    event.stopPropagation();
  }
}
