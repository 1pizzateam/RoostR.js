

export class Uniform {
  type : string;
  value : number|number[];

  constructor ( type:string, value:number|number[] ) {
    this.type = type;
    this.value = value;
  }

}
