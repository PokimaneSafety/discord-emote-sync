export class SetHelpers {
    public static Difference<T, R extends string = string>(
        a: Set<T>,
        b: Set<T>,
        navigator: (value: T) => R
    ): [Set<T>, Set<T>] {
        const aHashed = new Set<R>([...a.values()].map(navigator));
        const missingFromA = new Set<T>([...b.values()].filter((bValue) => !aHashed.has(navigator(bValue))));

        const bHashed = new Set<R>([...b.values()].map(navigator));
        const missingFromB = new Set<T>([...a.values()].filter((aValue) => !bHashed.has(navigator(aValue))));

        return [missingFromA, missingFromB];
    }
}
