import { describe, expect, it, vi } from "vitest";
import { NamePass } from "../../../../src/client/render/gl/passes/name-pass";
import { SkinAtlasArray } from "../../../../src/client/render/gl/passes/SkinAtlasArray";

describe("NamePass verified badge hover", () => {
  it("includes verified badge in nameplate hover bounding box", () => {
    const slot: any = { alive: true, startTime: 0, nameHalfWidth: 50 };
    for (const k of ["srcX", "tgtX"]) slot[k] = 100;
    for (const k of ["srcY", "tgtY"]) slot[k] = 200;
    for (const k of ["srcScale", "tgtScale"]) slot[k] = 10;
    slot.static = { smallID: 42, verified: true };

    const pass = Object.create(NamePass.prototype) as any;
    const name: any = {
      lerpSpeed: 10,
      nameScaleCap: 10,
      troopSizeMultiplier: 0.8,
    };
    name.nameScaleFactor = 1;
    Object.assign(pass, {
      settings: { name },
      slots: new Map([["p1", slot]]),
      fontBase: 32,
      fontSize: 32,
    });

    pass.setMouseWorldPos(145, 182);
    expect(pass.hitTestNamePlate(1)).toBe(42);
    slot.static.verified = false;
    expect(pass.hitTestNamePlate(1)).toBe(0);
  });
});

describe("SkinAtlasArray", () => {
  it("reuses scratch canvas across uploads", () => {
    const sub = vi.fn();
    const gl: any = new Proxy(
      { createTexture: () => ({}), texSubImage3D: sub },
      { get: (t: any, k: string) => t[k] ?? (() => {}) },
    );
    const canvases: HTMLCanvasElement[] = [];
    const orig = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((t) => {
      const el = orig(t);
      if (t === "canvas") canvases.push(el as HTMLCanvasElement);
      return el;
    });
    const atlas = new SkinAtlasArray(gl, [], () => {});
    const img = document.createElement("img");
    (atlas as any).uploadImage(img, 0);
    (atlas as any).uploadImage(img, 1);
    expect(canvases).toHaveLength(1);
    expect(sub).toHaveBeenCalledTimes(2);
    atlas.dispose();
  });
});
