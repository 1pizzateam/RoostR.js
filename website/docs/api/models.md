# Procedural Models

RoostR ships with built-in procedural compound models: `VWing` (starfighter spacecraft) and `Cannon` (defense artillery turret), which demonstrate complex multi-face mesh generation and articulated geometry.

```javascript
import { VWing, Cannon, Mesh, PhongShader, Material, Vec3 } from '@1pizzateam/roostr';

const ship = new Mesh(gl, new VWing(1.5));
ship.addProgram(PhongShader.create(gl));
ship.addMaterial(new Material({ diffuse: new Vec3(0.2, 0.7, 1.0) }));
scene.addMesh(ship);

const turret = new Mesh(gl, new Cannon(1.2));
turret.addProgram(PhongShader.create(gl));
turret.addMaterial(new Material({ diffuse: new Vec3(0.8, 0.3, 0.2) }));
turret.setPosition(4, 0, 0);
scene.addMesh(turret);
```

---

## `VWing`

A procedural sci-fi fighter craft model featuring a streamlined cockpit, swept wings, and twin engine thrusters.

```typescript
new VWing(scale: number = 1.0)
```

### Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scale` | `number` | `1.0` | Global scaling multiplier applied to ship geometry. |

---

## `Cannon`

A procedural artillery turret composed of a cylindrical rotating base, swivel carriage, and double-tapered gun barrel.

```typescript
new Cannon(scale: number = 1.0)
```

### Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scale` | `number` | `1.0` | Global scaling multiplier applied to cannon geometry. |
