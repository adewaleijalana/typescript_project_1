// const projTemp = document.getElementById(
//   'project-input'
// )! as HTMLTemplateElement;
// let clon = projTemp.content.cloneNode(true);
// document.body.appendChild(clon);

type Listerner = (items: Project[]) => void;

enum ProjectStatus {
  ACTIVE,
  FINISHED,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

class ProjectState {
  private projects: Project[] = [];
  private listeners: Listerner[] = [];
  private static INSTANCE: ProjectState;

  private constructor() {}

  static getInstance(): ProjectState {
    if (this.INSTANCE) {
      return this.INSTANCE;
    }
    this.INSTANCE = new ProjectState();
    return this.INSTANCE;
  }

  addListners(listenerFn: Listerner) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPpl: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPpl,
      ProjectStatus.ACTIVE
    );
    this.projects.push(newProject);
    for (const listerFn of projectState.listeners) {
      listerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

type Validatable = {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
};

function validate(validatable: Validatable) {
  let isValid = true;
  if (validatable.required) {
    isValid = isValid && validatable.value.toString().trim().length !== 0;
  }

  if (validatable.minLength != null && typeof validatable.value === 'string') {
    isValid = isValid && validatable.value.length >= validatable.minLength;
  }

  if (validatable.maxLength != null && typeof validatable.value === 'string') {
    isValid = isValid && validatable.value.length <= validatable.maxLength;
  }

  if (validatable.min != null && typeof validatable.value === 'number') {
    isValid = isValid && validatable.value >= validatable.min;
  }

  if (validatable.max != null && typeof validatable.value === 'number') {
    isValid = isValid && validatable.value <= validatable.max;
  }
  return isValid;
}

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundedFn = originalMethod.bind(this);
      return boundedFn;
    },
  };
  return adjDescriptor;
}

class ProjectList {
  tempElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    this.tempElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.tempElement.content, true);

    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListners((projects: Project[]) => {
      const relevantProjs = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.ACTIVE;
        }
        return prj.status === ProjectStatus.FINISHED;
      });
      this.assignedProjects = relevantProjs;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listElements = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listElements.innerHTML = '';
    for (const prjList of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjList.title;
      listElements.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
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

    this.configure();
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }

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

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
}

const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
