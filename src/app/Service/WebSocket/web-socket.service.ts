import { Injectable } from '@angular/core';
import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { Client } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { UserStatus } from 'src/app/Interface/UserStatus';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public rxStomp!: RxStomp;
  private subscriptions = new Map<string, Subscription>();
  private connected: boolean = false;
  public stompClient!: Client;

  constructor() {
    const config: RxStompConfig = {
      webSocketFactory: () => new SockJS('http://localhost:4121/FreeSocial/ws')
    };

    this.rxStomp = new RxStomp();
    this.rxStomp.configure(config);
  }

  public connect(): void {
    if (!this.rxStomp.active) {
        console.log("Activando conexión RxStomp...");
        this.rxStomp.activate();

        // Suscribirse a los cambios de estado de la conexión
        this.rxStomp.connectionState$.subscribe(state => {
            console.log("Estado de la conexión -> " + state);

            // Verifica si el estado es 1 (conectado)
            if (state === 1) {
                console.log("Conexión establecida con éxito.");
                this.connected = true; // Actualiza el estado de la conexión
            } else {
                console.log("Conexión no establecida o desconectada.");
                this.connected = false;
            }
        });
    }
  }


  public sendMessage(endpoint: string, message: any): void {
    console.log("enviando mensaje a ",endpoint)
    if (this.rxStomp.active) {
      this.rxStomp.publish({ destination: endpoint, body: JSON.stringify(message) });
    } else {
      this.connect();
      setTimeout(() => this.sendMessage(endpoint, message), 1000); // Espera y reintenta
    }
  }

  public subscribeToTopic(topic: string, callback: (message: any) => void): void {
    const subscription = this.rxStomp.watch(topic).subscribe({
      next: (message) => {
        callback(JSON.parse(message.body));
      },
      error: err => console.error(`Error en la suscripción a ${topic}:`, err),
      complete: () => console.log(`Suscripción a ${topic} completada`)
    });
    this.subscriptions.set(topic, subscription);
  }

  public subscribeToTopicSaludo(topic: string, callback: (message: any) => void): Subscription {
    const subscription = this.rxStomp.watch(topic).subscribe({
        next: (message) => {
            try {
                const parsedMessage = JSON.parse(message.body);
                callback(parsedMessage);
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        },
        error: err => console.error(`Error en la suscripción a ${topic}:`, err),
        complete: () => console.log(`Suscripción a ${topic} completada`)
    });

    this.subscriptions.set(topic, subscription);

    return subscription;  // Retorna la suscripción
  }

  public subscribeToTopicStatus(topic: string, callback: (status: any) => void): Subscription {
    return this.rxStomp.watch(topic).subscribe({
      next: (message) => {
        const status = JSON.parse(message.body);
        callback(status);
      },
      error: (error) => console.error(`Error en la suscripción a ${topic}:`, error),
      complete: () => console.log(`Suscripción a ${topic} completada`)
    });
  }

  public unsubscribeFromTopic(topic: string): void {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    } else {
      console.warn(`Intento de desuscribir de un tópico no suscrito: ${topic}`);
    }
  }

  public reportarUsuarioConectado(userId: number | null, isConnected: boolean): void {
    const endpoint = "/app/user-connected";
    this.sendMessage(endpoint, { userId: userId, connected: isConnected });
  }


  public disconnect() {
    if (this.rxStomp.active) {
      this.rxStomp.deactivate();
    }
  }
}
