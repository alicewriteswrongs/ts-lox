export class Return extends Error {
  value: any;

  constructor(value: any) {
    super()
    this.value = value
  }
}
