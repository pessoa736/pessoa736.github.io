


export function staticPropotion(value: number, base: number = 1300) {
    return `calc(100vmax * ${value}/${base})`;
}