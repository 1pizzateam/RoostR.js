import { Vec3 } from '@1pizzateam/spock';
import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Cube extends BasicMesh {

  constructor(size: Vec3 = new Vec3(2.0, 2.0, 2.0), flat: boolean = false) {
    super();
    const halfX = (size ? size.x : 2.0) * 0.5;
    const halfY = (size ? size.y : 2.0) * 0.5;
    const halfZ = (size ? size.z : 2.0) * 0.5;
    const sx = halfX || 1.0;
    const sy = halfY || 1.0;
    const sz = halfZ || 1.0;

    if (flat) {
      this.vertices = [
        // Front (+Z)
        -sx, -sy,  sz,   sx, -sy,  sz,   sx,  sy,  sz,  -sx,  sy,  sz,
        // Back (-Z)
         sx, -sy, -sz,  -sx, -sy, -sz,  -sx,  sy, -sz,   sx,  sy, -sz,
        // Top (+Y)
        -sx,  sy,  sz,   sx,  sy,  sz,   sx,  sy, -sz,  -sx,  sy, -sz,
        // Bottom (-Y)
        -sx, -sy, -sz,   sx, -sy, -sz,   sx, -sy,  sz,  -sx, -sy,  sz,
        // Right (+X)
         sx, -sy,  sz,   sx, -sy, -sz,   sx,  sy, -sz,   sx,  sy,  sz,
        // Left (-X)
        -sx, -sy, -sz,  -sx, -sy,  sz,  -sx,  sy,  sz,  -sx,  sy, -sz
      ];

      this.normals = [
        // Front (+Z)
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        // Back (-Z)
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // Top (+Y)
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        // Bottom (-Y)
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        // Right (+X)
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        // Left (-X)
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
      ];

      this.indices = [
        0, 1, 2,    0, 2, 3,    // Front
        4, 5, 6,    4, 6, 7,    // Back
        8, 9, 10,   8, 10, 11,  // Top
        12, 13, 14, 12, 14, 15, // Bottom
        16, 17, 18, 16, 18, 19, // Right
        20, 21, 22, 20, 22, 23  // Left
      ];

      this.subMeshes = [
        new SubMesh(0, 36)
      ];
      return;
    }

    this.vertices = [  sx,-sy,-sz,
                      -sx,-sy, sz,
                       sx,-sy, sz,
                      -sx, sy, sz,
                       sx, sy,-sz,
                       sx, sy, sz,
                      -sx,-sy,-sz,
                      -sx, sy,-sz
                    ];
    this.indices = [  2,5,3, 2,3,1,
                      4,0,6, 4,6,7,
                      3,5,4, 3,4,7,
                      0,2,1, 0,1,6,
                      5,2,0, 5,0,4,
                      6,1,3, 6,3,7
                    ];
    this.normals = [ 0.5773,-0.5773,-0.5773,
                    -0.5773,-0.5773, 0.5773,
                     0.5773,-0.5773, 0.5773,
                    -0.5773, 0.5773, 0.5773,
                     0.5773, 0.5773,-0.5773,
                     0.5773, 0.5773, 0.5773,
                    -0.5773,-0.5773,-0.5773,
                    -0.5773, 0.5773,-0.5773
                  ];
    this.subMeshes = [
      new SubMesh( 0, 36)
    ];
  }

}
