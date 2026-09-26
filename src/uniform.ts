

export class Uniform {
  type : string;
  value : number | number[] | Float32Array | Int32Array;

  constructor ( type:string, value:number | number[] | Float32Array | Int32Array ) {
    this.type = type;
    this.value = value;
  }

}
