export interface QuestionOption {
  id: string;
  src: string;
}

export interface ImageQuestion {
  number: number;
  options: QuestionOption[];
}
