import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Cube extends BasicMesh {

  constructor(size: number = 1.0, flat: boolean = false) {
    super();
    size = size ? size * 0.5 : 1.0;

    if (flat) {
      this.vertices = [
        // Front (+Z)
        -size, -size,  size,   size, -size,  size,   size,  size,  size,  -size,  size,  size,
        // Back (-Z)
         size, -size, -size,  -size, -size, -size,  -size,  size, -size,   size,  size, -size,
        // Top (+Y)
        -size,  size,  size,   size,  size,  size,   size,  size, -size,  -size,  size, -size,
        // Bottom (-Y)
        -size, -size, -size,   size, -size, -size,   size, -size,  size,  -size, -size,  size,
        // Right (+X)
         size, -size,  size,   size, -size, -size,   size,  size, -size,   size,  size,  size,
        // Left (-X)
        -size, -size, -size,  -size, -size,  size,  -size,  size,  size,  -size,  size, -size
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

    this.vertices = [  size,-size,-size,
                      -size,-size, size,
                       size,-size, size,
                      -size, size, size,
                       size, size,-size,
                       size, size, size,
                      -size,-size,-size,
                      -size, size,-size
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
