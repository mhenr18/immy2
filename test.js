const Immy = require('./dist/Immy')

function resolveWall (wall, pathWithCutouts) {
  return {
    wall,
    path: pathWithCutouts.path,
    cutouts: pathWithCutouts.cutouts
  }
}

const components = Immy.select
  .fromMap()
  .ungroup()

const pathsByCode = Immy.select
  .from(components)
  .filter(c => c.type === 'path')
  .map(c => [c.code, c])
  .toMap()

const cutouts = Immy.select
  .from(components)
  .filter(c => c.type === 'cutout')

const cutoutsByTargetCode = Immy.select
  .from(cutouts)
  .groupBy(c => c.target)

const componentsByCode = Immy.select
  .from(components)
  .map(c => [c.code, c])
  .toMap()

const pathsWithCutoutsByPathCode = Immy.select
  .from(pathsByCode)
  .join(cutoutsByTargetCode, (code, path, resolveOne) => ({ path, cutouts: resolveOne(code) || Immy.List() }))

const pathCodesByEntityCode = Immy.select
  .fromMap()
  .ungroup((component, entityCode) => ({ entityCode, component }))
  .filter(x => x.component.type === 'path')
  .groupBy(x => x.entityCode, x => x.component.code)

const pathsWithCutoutsByEntityCode = Immy.select
  .from(pathCodesByEntityCode)
  .join(pathsWithCutoutsByPathCode, (entityCode, pathCodes, _, resolveMany) => resolveMany(pathCodes))

const entityCodeByWall = Immy.select
  .fromMap()
  .ungroup((component, entityCode) => [component, entityCode])
  .filter(x => x[0].type === 'wall')
  .toMap()

const resolvedWalls = Immy.select
  .from(entityCodeByWall)
  .join(pathsWithCutoutsByEntityCode, (wall, entityCode, resolveOne) => resolveOne(entityCode) || Immy.List())
  .ungroup((pathWithCutouts, wall) => resolveWall(wall, pathWithCutouts))


let componentsByEntityCode = Immy.Map(new Map([
  ['ent_0', Immy.List([
    { code: 'cmp_a', type: 'wall' },
    { code: 'cmp_b', type: 'path' },
    { code: 'cmp_c', type: 'path' },
    { code: 'cmp_d', type: 'path' },
    { code: 'cmp_e', type: 'path' },
  ])],
  ['ent_1', Immy.List([
    { code: 'cmp_f', type: 'hingedDoor' },
    { code: 'cmp_g', type: 'frame' },
    { code: 'cmp_h', type: 'cutout', target: 'cmp_c' },
    { code: 'cmp_i', type: 'cutout', target: 'cmp_c' },
  ])],
  ['ent_2', Immy.List([
    { code: 'cmp_j', type: 'point' },
    { code: 'cmp_k', type: 'evacSign' },
  ])],
  ['ent_3', Immy.List([
    { code: 'cmp_l', type: 'wall' },
    { code: 'cmp_m', type: 'path' },
    { code: 'cmp_n', type: 'path' },
  ])],
  ['ent_4', Immy.List([
    { code: 'cmp_o', type: 'slidingDoor' },
    { code: 'cmp_p', type: 'frame' },
    { code: 'cmp_q', type: 'cutout', target: 'cmp_e' },
    { code: 'cmp_r', type: 'cutout', target: 'cmp_e' },
  ])],
  ['ent_5', Immy.List([
    { code: 'cmp_s', type: 'wall' },
    { code: 'cmp_t', type: 'path' },
    { code: 'cmp_u', type: 'path' },
    { code: 'cmp_v', type: 'path' },
  ])],
  ['ent_6', Immy.List([
    { code: 'cmp_w', type: 'window' },
    { code: 'cmp_x', type: 'frame' },
    { code: 'cmp_y', type: 'cutout', target: 'cmp_m' },
    { code: 'cmp_z', type: 'cutout', target: 'cmp_n' },
  ])]
]))


let resolvedA = resolvedWalls(componentsByEntityCode)

function logResolvedWalls (resolvedWalls) {
  for (let resolvedWall of resolvedWalls) {
    console.log(resolvedWall)
    console.log()
  }
}

console.log()
console.log('resolvedA')
console.log('---------------------------------')
logResolvedWalls(resolvedA)
console.log()

let componentsByEntityCodeB = componentsByEntityCode.update('ent_4', components => components.set(3, { code: 'cmp_r', type: 'cutout', target: 'cmp_b' }))

let resolvedB = resolvedWalls(componentsByEntityCodeB)

console.log()
console.log('resolvedB')
console.log('---------------------------------')
logResolvedWalls(resolvedB)
console.log()
console.log()

console.log('diff')
console.log('---------------------------------')
resolvedA.observeChangesFor(resolvedB, {
  insert: (i, value) => console.log('insert', i, value),
  delete: (i, value) => console.log('delete', i, value),
  set: (i, oldValue, newValue) => console.log('set', i, newValue)
})
console.log()
console.log()
