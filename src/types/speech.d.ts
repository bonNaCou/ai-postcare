declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition;
    }
  
    // Define el tipo de SpeechRecognition si no existe
    interface SpeechRecognition extends EventTarget {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start(): void;
      stop(): void;
      abort(): void;
      onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
      onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
      onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
      onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    }
  
    interface SpeechRecognitionEvent extends Event {
      readonly resultIndex: number;
      readonly results: SpeechRecognitionResultList;
    }
  }
  
  export {};
  