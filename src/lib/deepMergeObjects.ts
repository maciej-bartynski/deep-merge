import { AnyObjectOrArray } from "./types.js";

function deepMergeObjects<T extends AnyObjectOrArray>(
    source: T,
    updationData: Partial<T>,
    pathHandlers?: Record<string, (source: any, updationData: any) => any>,
    options?: {
        arrayMergeStrategy?: 'concat' | 'replace';
    }
): T {

    const _pathHandlers = pathHandlers ?? {};
    const _options = options ? options : {
        arrayMergeStrategy: 'concat' as 'concat',
    };

    if (source === null || updationData === null) {
        const errors: string[] = ['[utils/deepMergeObjects]'];

        if (!(source instanceof Object)) {
            errors.push('Received null for first parameter.');
        }

        if (!(source instanceof Object)) {
            errors.push('Received null for second parameter.');
        }

        throw errors.join(' ');
    }

    if (!(source instanceof Object) || !(updationData instanceof Object)) {
        const errors: string[] = ['[utils/deepMergeObjects]'];

        if (!(source instanceof Object)) {
            errors.push('First parameter must be an Object.')
        }

        if (!(source instanceof Object)) {
            errors.push('Second parameter must be an Object.')
        }

        throw errors.join(' ');
    }

    const {
        flatMergedObjects,
        sourceCopy,
        updationDataCopy
    } = flatMergeObjects(source, updationData, _options);

    const currentPath = '';
    return recursiveTraverse<T>(flatMergedObjects, sourceCopy, updationDataCopy, currentPath, _pathHandlers, _options);
}

function flatMergeObjects<T extends AnyObjectOrArray>(source: T, updationData: Partial<T>, options: {
    arrayMergeStrategy?: 'concat' | 'replace';
}): {
    flatMergedObjects: T;
    sourceCopy: T;
    updationDataCopy: Partial<T>;
} {

    let flatMergedObjects: T;
    let sourceCopy: T;
    let updationDataCopy: Partial<T>;

    if (source instanceof Array && updationData instanceof Array) {
        if (options?.arrayMergeStrategy === 'replace') {
            flatMergedObjects = [...updationData] as T;
            sourceCopy = [...source as any] as T;
            updationDataCopy = [...updationData] as unknown as Partial<T>;
        } else {
            flatMergedObjects = [...source, ...updationData] as T;
            sourceCopy = [...flatMergedObjects as any] as T;
            updationDataCopy = [] as unknown as Partial<T>;
        }
    } else if (source instanceof Array) {
        flatMergedObjects = { ...updationData } as T;
        sourceCopy = { ...updationData } as T;
        updationDataCopy = { ...updationData } as T;
    } else if (updationData instanceof Array) {
        flatMergedObjects = { ...source, ...updationData } as T;
        sourceCopy = { ...source } as T;
        updationDataCopy = { ...updationData } as T;
    } else {
        flatMergedObjects = { ...source, ...updationData };
        sourceCopy = { ...source } as T;
        updationDataCopy = { ...updationData } as T;
    }

    return {
        flatMergedObjects,
        sourceCopy,
        updationDataCopy,
    }
}

function isTraversable(parameter: unknown): parameter is AnyObjectOrArray {
    if (parameter instanceof Object) {
        return true;
    }

    if (Array.isArray(parameter)) {
        return true;
    }

    switch (true) {
        case parameter === null: // null is an object
        case (typeof parameter === 'string'):
        case (typeof parameter === 'number'): // including NaN
        case (typeof parameter === 'boolean'):
        case (typeof parameter === 'function'):
        case (typeof parameter === 'undefined'):
        case (typeof parameter === 'symbol'): {
            return false;
        }
        default: {
            return true;
        }
    }

}

function recursiveTraverse<T extends AnyObjectOrArray>(
    flatMergedObject: T,
    flatMergingSource: Partial<T>,
    flatMergingUpdationData: Partial<T>,
    currentPath: string,
    pathHandlers: Record<string, (source: any, updationData: any) => any>,
    options: {
        arrayMergeStrategy?: 'concat' | 'replace';
    }
): T {

    if (Array.isArray(flatMergedObject)) {
        return flatMergedObject.map((item, index) => {
            const separator = currentPath ? '.' : '';
            const _currentPath = `${currentPath}${separator}${index}`;

            const pathHandler: undefined | ((source: any, updationData: any) => T) = pathHandlers?.[_currentPath];
            if (pathHandler) {
                const result = pathHandler(item, item);
                return result;
            }
            if (isTraversable(item)) {
                return recursiveTraverse(item, item, Array.isArray(item) ? [] : {}, _currentPath, pathHandlers, options)
            } else {
                return item;
            }
        }) as T;
    }

    const flatMergedObjectCopy: T = { ...flatMergedObject };
    const flatMergingSourceCopy: T = Array.isArray(flatMergingSource) ? [...flatMergingSource] as T : { ...flatMergingSource } as T;
    const flatMergingUpdationDataCopy: T = Array.isArray(flatMergingUpdationData) ? [...(flatMergingUpdationData)] as T : { ...flatMergingUpdationData } as T;

    Object.keys(flatMergedObject).forEach((key: keyof T) => {



        const separator = currentPath ? '.' : '';
        const _currentPath = `${currentPath}${separator}${String(key)}`;



        const pathHandler: undefined | ((source: any, updationData: any) => T) = pathHandlers?.[_currentPath];

        if (pathHandler) {
            const result = pathHandler(flatMergingSourceCopy[key], flatMergingUpdationDataCopy[key]);
            flatMergedObjectCopy[key] = result as any;
            return;
        }

        const flatMergingSourceValue = flatMergingSourceCopy[key];
        const flatMergingUpdationDataValue = flatMergingUpdationDataCopy[key];



        if (isTraversable(flatMergingSourceValue) && isTraversable(flatMergingUpdationDataValue)) {



            const {
                flatMergedObjects,
                sourceCopy,
                updationDataCopy
            } = flatMergeObjects(flatMergingSourceValue, flatMergingUpdationDataValue, options);

            flatMergedObjectCopy[key] = recursiveTraverse(flatMergedObjects, sourceCopy, updationDataCopy, _currentPath, pathHandlers, options) as T[keyof T];
        } else {
            const value = Object.hasOwn(flatMergingUpdationDataCopy, key) ? flatMergingUpdationDataCopy[key] : flatMergingSourceCopy[key];

            flatMergedObjectCopy[key] = isTraversable(value)
                ? recursiveTraverse(value, value, (Array.isArray(value) ? [] : {}) as any, _currentPath, pathHandlers, options)
                : value;
        }

    });

    return flatMergedObjectCopy;
}

export default deepMergeObjects;

