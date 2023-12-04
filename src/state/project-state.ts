import { Project, ProjectStatus } from '../models/project';

type Listerner<T> = (items: T[]) => void;

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

export const projectState = ProjectState.getInstance();
