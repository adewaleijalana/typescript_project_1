export function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
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
