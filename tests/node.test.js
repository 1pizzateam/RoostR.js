import { Node, Vec3, Quat, Mat4x3, BoundingBox } from "../dist/roostr";

describe("Node", () => {
  test("initializes default transforms and identity matrices", () => {
    const node = new Node();
    expect(node.position.toArray()).toEqual([0, 0, 0]);
    expect(node.scale.toArray()).toEqual([1, 1, 1]);
    expect(node.parent).toBeNull();
    expect(node.children).toEqual([]);
    expect(node.modelMatrix.toArray()).toEqual(new Mat4x3().identity().toArray());
    expect(node.worldMatrix.toArray()).toEqual(new Mat4x3().identity().toArray());
  });

  test("setPosition and translate update position and mark dirty", () => {
    const node = new Node();
    node.setPosition(new Vec3(10, 20, 30));
    expect(node.position.toArray()).toEqual([10, 20, 30]);

    node.translate(new Vec3(1, -2, 3));
    expect(node.position.toArray()).toEqual([11, 18, 33]);

    node.translate(new Vec3(-1, 2, -3));
    expect(node.position.toArray()).toEqual([10, 20, 30]);
  });

  test("rotation Euler and Quaternion remain synchronized", () => {
    const node = new Node();
    node.setRotation(new Vec3(0, Math.PI / 4, 0));
    expect(node.rotation.y).toBeCloseTo(Math.PI / 4);

    node.rotateY(Math.PI / 4);
    expect(node.rotation.y).toBeCloseTo(Math.PI / 2);
  });

  test("setScale and scaleBy update scaling", () => {
    const node = new Node();
    node.setScale(new Vec3(2, 2, 2));
    expect(node.scale.toArray()).toEqual([2, 2, 2]);

    node.scaleBy(new Vec3(2, 3, 4));
    expect(node.scale.toArray()).toEqual([4, 6, 8]);
  });

  test("lookAt orients negative Z toward target", () => {
    const node = new Node();
    node.setPosition(new Vec3(0, 0, 0));
    node.lookAt(new Vec3(0, 0, -10));

    const dir = node.getWorldDirection();
    expect(dir.z).toBeCloseTo(-1);
  });

  test("addChild and removeChild manage parent-child tree", () => {
    const parent = new Node();
    const child1 = new Node();
    const child2 = new Node();

    parent.addChild(child1);
    parent.addChild(child2);

    expect(parent.children.length).toBe(2);
    expect(child1.parent).toBe(parent);
    expect(child2.parent).toBe(parent);

    expect(parent.removeChild(child1)).toBe(true);
    expect(child1.parent).toBeNull();
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toBe(child2);
  });

  test("setLocalBounds and computeBounds calculate world bounding box and sphere", () => {
    const node = new Node();
    node.setLocalBounds(new BoundingBox(new Vec3(-2, -2, -2), new Vec3(2, 2, 2)));
    node.setPosition(new Vec3(10, 0, 0));
    node.updateModelMatrix();
    node.setWorldMatrix(new Mat4x3().identity());
    node.computeBounds();

    const center = new Vec3();
    node.boundingBox.getCenter(center);
    expect(center.x).toBeCloseTo(10);
    expect(node.boundingSphere.radius).toBeCloseTo(Math.sqrt(12));
  });

  test("distanceTo and isInsideBounds", () => {
    const a = new Node();
    const b = new Node();
    a.setPosition(new Vec3(0, 0, 0));
    b.setPosition(new Vec3(3, 4, 0));
    a.updateModelMatrix();
    b.updateModelMatrix();
    a.setWorldMatrix(new Mat4x3().identity());
    b.setWorldMatrix(new Mat4x3().identity());

    expect(a.distanceTo(b)).toBeCloseTo(5);

    const box = new BoundingBox(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    expect(a.isInsideBounds(box)).toBe(true);
    expect(b.isInsideBounds(box)).toBe(false);

    const c = new Node();
    c.setLocalBounds(box);
    c.computeBounds();
    expect(c.boundingBox.min.toArray()).toEqual([-1, -1, -1]);
    expect(c.boundingBox.max.toArray()).toEqual([1, 1, 1]);
  });
});
