// const projTemp = document.getElementById(
//   'project-input'
// )! as HTMLTemplateElement;
// let clon = projTemp.content.cloneNode(true);
// document.body.appendChild(clon);

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundedFn = originalMethod.bind(this)
            return boundedFn;
        },
    };
    return adjDescriptor;
}

class ProjectInput {
  tempElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  pplInputEl: HTMLInputElement;

  constructor() {
    this.tempElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.tempElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputEl = this.element.querySelector(
      '#title'
    )! as HTMLInputElement;

    this.descriptionInputEl = this.element.querySelector(
      '#description'
    )! as HTMLInputElement;

    this.pplInputEl = this.element.querySelector(
      '#people'
    )! as HTMLInputElement;

    this.configure()
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }

  @Autobind
  private submitHandler(event: Event){
    event.preventDefault();
    console.log(this.titleInputEl.value);
  }

  private configure(){
    this.element.addEventListener('submit', this.submitHandler)
  }
}

const projInput = new ProjectInput();
