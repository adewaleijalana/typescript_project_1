// const projTemp = document.getElementById(
//   'project-input'
// )! as HTMLTemplateElement;
// let clon = projTemp.content.cloneNode(true);
// document.body.appendChild(clon);
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

type Listerner<T> = (items: T[]) => void;

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

class State<T> {
  protected listeners: Listerner<T>[] = [];

  addListners(listenerFn: Listerner<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];

  private static INSTANCE: ProjectState;

  private constructor() {
    super();
  }

  static getInstance(): ProjectState {
    if (this.INSTANCE) {
      return this.INSTANCE;
    }
    this.INSTANCE = new ProjectState();
    return this.INSTANCE;
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
    this.updateListerns();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((proj) => proj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListerns();
    }
  }

  private updateListerns() {
    for (const listerFn of this.listeners) {
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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  tempElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElemetId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.tempElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElemetId)! as T;

    const importedNode = document.importNode(this.tempElement.content, true);

    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  // @Autobind
  dragEndHandler(_: DragEvent): void {
    console.log('drag end');
  }

  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.persons} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')! as HTMLUListElement;
      listEl.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED
    );
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector('ul')! as HTMLUListElement;
    listEl.classList.remove('droppable');
  }

  private renderProjects() {
    const listElements = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listElements.innerHTML = '';
    for (const prjList of this.assignedProjects) {
      // const listItem = document.createElement('li');
      // listItem.textContent = prjList.title;
      // listElements.appendChild(listItem);
      new ProjectItem(this.element.querySelector('ul')!.id, prjList);
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

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
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  // private attach() {
  //   this.hostElement.insertAdjacentElement('beforeend', this.element);
  // }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
