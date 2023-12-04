import { validate, Validatable } from '../util/validation';
import { Autobind } from '../decorators/autobind';
import { Component } from './base-component';
import { projectState } from '../state/project-state';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  pplInputEl: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputEl = this.element.querySelector(
      '#title'
    )! as HTMLInputElement;

    this.descriptionInputEl = this.element.querySelector(
      '#description'
    )! as HTMLInputElement;

    this.pplInputEl = this.element.querySelector(
      '#people'
    )! as HTMLInputElement;

    this.configure();
    // this.attach();
  }

  // attach() {
  //   this.hostElement.insertAdjacentElement('afterbegin', this.element);
  // }

  private gettAllUserInputs(): [string, string, number] | void {
    const enteredTitle = this.titleInputEl.value;
    const enteredDescription = this.descriptionInputEl.value;
    const enteredPpl = +this.pplInputEl.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const enteredDescriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const enteredPplValidatable: Validatable = {
      value: +enteredPpl,
      required: true,
      min: 1,
    };

    if (
      // enteredTitle.trim().length === 0 ||
      // enteredDescription.trim().length === 0 ||
      // enteredPpl.trim().length === 0

      !validate(titleValidatable) ||
      !validate(enteredDescriptionValidatable) ||
      !validate(enteredPplValidatable)
    ) {
      alert('Invalid input, please enter correct value');
      return;
    } else {
      return [enteredTitle, enteredDescription, enteredPpl];
    }
  }

  private clearAllInputs() {
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
    this.pplInputEl.value = '';
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    // console.log(this.titleInputEl.value);
    const userInputs = this.gettAllUserInputs();
    if (Array.isArray(userInputs)) {
      const [title, desc, people] = userInputs;
      console.log(`Title: ${title}; Description: ${desc}; People: ${people}`);
      projectState.addProject(title, desc, people);
      this.clearAllInputs();
    }
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}
}
