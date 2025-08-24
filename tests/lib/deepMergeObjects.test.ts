import { describe, it, expect } from 'vitest';
import deepMergeObjects from '#src/index.js';

describe('Throws error when', () => {
    it('source is not an object', () => {
        expect(() => deepMergeObjects(null as any, {})).toThrow();
    })

    it('updation is not an object', () => {
        expect(() => deepMergeObjects({}, null as any)).toThrow();
    })

    it('source and uptadion are null', () => {
        expect(() => deepMergeObjects(null as any, null as any)).toThrow();
    })

    it('source is number, updation is string', () => {
        expect(() => deepMergeObjects(1 as any, 'test' as any)).toThrow();
    })
})

describe('Handles root level array', () => {
    it('as source and updation', () => {
        const source = [1, 2, 3];
        const updation = [4, 5, 6];
        const result = deepMergeObjects<typeof source>(source, updation);
        expect(result).toStrictEqual([1, 2, 3, 4, 5, 6]);
    })

    it('as source', () => {
        const source = [1, 2, 3];
        const updation = { 3: 4, 4: 5 };
        const result = deepMergeObjects<typeof source | typeof updation>(source, updation);
        expect(result).toStrictEqual({ 3: 4, 4: 5 });
    })

    it('as updation', () => {
        const source = { 3: 3, 4: 4, 5: 5 };
        const updation = [0, 1, 2];
        const result = deepMergeObjects<typeof source | typeof updation>(source, updation);
        expect(result).toStrictEqual({ 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 });
    })
})

describe('Merges two objects', () => {
    it('Flat update field', () => {
        const target = { name: 'Frodo', surname: 'Bagins', age: 33 };
        const updation = { age: 44 };

        const result = deepMergeObjects<typeof target>(target, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Bagins',
            age: 44,
        })
    })

    it('Add new field', () => {
        const target = { name: 'Frodo', surname: 'Bagins', age: 33 };
        const updation = { lastName: 'son of Drogo' };

        const result = deepMergeObjects<Partial<typeof target & typeof updation>>(target, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Bagins',
            age: 33,
            lastName: 'son of Drogo',
        })
    })

    it('Add traversable field, update flat field', () => {
        const target = {
            name: 'Frodo',
            surname: 'Bagins',
            age: 33
        };
        const updation = {
            surname: 'Baggins',
            genealogy: {
                father: 'Drogo',
                mother: 'Arwen',
                children: [
                    { name: 'Aragorn', age: 88 },
                    { name: 'Elrond', age: 120 },
                    {
                        name: 'Celeborn', age: 120,
                        enemies: [
                            { name: 'Sauron' }, { name: 'Morgoth' }
                        ]
                    },
                ]
            }
        };

        const result = deepMergeObjects<Partial<typeof target & typeof updation>>(target, updation);
        expect(result).toStrictEqual({
            name: 'Frodo',
            age: 33,
            surname: 'Baggins',
            genealogy: {
                father: 'Drogo',
                mother: 'Arwen',
                children: [
                    { name: 'Aragorn', age: 88 },
                    { name: 'Elrond', age: 120 },
                    {
                        name: 'Celeborn', age: 120, enemies: [
                            { name: 'Sauron' }, { name: 'Morgoth' }
                        ]
                    },
                ]
            }
        })
    })

    it('Deeply merges traversable fields', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            genealogy: {
                father: null,
                mother: 'Arwen',
                children: {
                    aragorn: { age: 88 },
                    elrond: { age: 120 },
                    celeborn: {
                        age: 120,
                        enemies: {
                            Morgoth: true,
                            orcs: ['Azog', 'Bolg', 'Golg']
                        }
                    },
                }
            }
        };
        const updation = {
            genealogy: {
                father: 'Drogo',
                children: {
                    celeborn: {
                        enemies: {
                            Sauron: true,
                            orcs: ['Bolg', 'Torok']
                        }
                    },
                }
            }
        };

        const result = deepMergeObjects<Partial<typeof target | typeof updation>>(target, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            genealogy: {
                children: {
                    aragorn: { age: 88 },
                    elrond: { age: 120 },
                    celeborn: {
                        age: 120,
                        enemies: {
                            Sauron: true,
                            Morgoth: true,
                            orcs: ['Azog', 'Bolg', 'Golg', 'Bolg', 'Torok']
                        }
                    },
                },
                father: 'Drogo',
                mother: 'Arwen',
            }
        })
    })

    it('Concatenates arrays', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth', 'Azog'],
        };
        const updation = {
            enemies: ['Sauron', { name: 'Morgoth', age: 1000 }, 'Torok'],
        };

        const result = deepMergeObjects<Partial<typeof target | typeof updation>>(target, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth', 'Azog', 'Sauron', { name: 'Morgoth', age: 1000 }, 'Torok'],
        })
    })

    it('Overrides array with object, treats updation as non-mergeable with array', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth', 'Azog'],
        };
        const updation = {
            enemies: {
                'Sauron': { name: 'Sauron', age: 1000 },
                'Torok': { name: 'Torok' },
                '2': 'Azog the Destroyer'
            },
        };

        const result = deepMergeObjects<Partial<typeof target | typeof updation>>(target, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            enemies: {
                'Sauron': { name: 'Sauron', age: 1000 },
                'Torok': { name: 'Torok' },
                '2': 'Azog the Destroyer',
            },
        })
    })

    it('Concatenates object with array, treats array indexes as object keys', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            additionalData: {
                enemies: {
                    'Sauron': { name: 'Sauron', age: 1001 },
                    'Torok': { name: 'Torok' },
                    '0': { name: 'Azog' },
                    1: { name: 'Golg', age: 122 }
                },
                natonality: 'Humanoid',
            }
        };
        const updation = {
            additionalData: {
                enemies: ['Sauron', { age: 133 }, 'Azog'],
                natonality: 'Hobbit',
            }
        };
        const result = deepMergeObjects<Partial<typeof target | typeof updation>>(target, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            additionalData: {
                enemies: {
                    'Sauron': { name: 'Sauron', age: 1001 },
                    'Torok': { name: 'Torok' },
                    '0': 'Sauron',
                    '1': { name: 'Golg', age: 133 },
                    '2': 'Azog',
                },
                natonality: 'Hobbit',
            },
        })
    });

    it('Overwrites collection value with updation primitive value', () => {
        const entity = {
            name: 'Frodo',
            surname: 'Baggins',
            additionalData: {
                enemies: ['Sauron', 'Morgoth', 'Azog'],
                appearance: 'Humanoid',
                address: {
                    country: {
                        name: 'Shire',
                        capital: {
                            name: 'Bree',
                            population: 1000,
                            streets: ['Bag End', 'Bagshot Row'],
                        },
                        population: 3000,
                        city: {
                            name: 'Hobbiton',
                            population: 1000,
                            streets: [{
                                name: 'Bag End',
                                number: 1,
                            }, {
                                name: 'Bagshot Row',
                                number: 2,
                            }]
                        },
                    },
                    continent: {
                        name: 'Middle Earth',
                        population: 1000000,
                        cities: ['Minas Tirith', 'Rivendell', 'Hobbiton'],
                    },
                }
            },
        };
        const updation = {
            additionalData: {
                address: {
                    country: 'Gondor',
                }
            }
        }

        const result = deepMergeObjects<Partial<typeof entity | typeof updation>>(entity, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            additionalData: {
                address: {
                    continent: {
                        name: 'Middle Earth',
                        population: 1000000,
                        cities: ['Minas Tirith', 'Rivendell', 'Hobbiton'],
                    },
                    country: 'Gondor',
                },
                enemies: ['Sauron', 'Morgoth', 'Azog'],
                appearance: 'Humanoid',
            }
        })
    });

    it('Overwrites primitive value with updation collection value', () => {
        const entity = {
            name: 'Frodo',
            surname: 'Baggins',
            additionalData: {
                enemies: ['Sauron', 'Morgoth', 'Azog'],
                appearance: 'Humanoid',
                address: {
                    country: 'Gondor',
                }
            },
        };
        const updation = {
            additionalData: {
                address: {
                    country: {
                        name: 'Shire',
                        capital: {
                            name: 'Bree',
                            population: 1000,
                            streets: ['Bag End', 'Bagshot Row'],
                        },
                        population: 3000,
                        city: {
                            name: 'Hobbiton',
                            population: 1000,
                            streets: [{
                                name: 'Bag End',
                                number: 1,
                            }, {
                                name: 'Bagshot Row',
                                number: 2,
                            }]
                        },
                    },
                    continent: {
                        name: 'Middle Earth',
                        population: 1000000,
                        cities: ['Minas Tirith', 'Rivendell', 'Hobbiton'],
                    },
                }
            }
        }

        const result = deepMergeObjects<Partial<typeof entity | typeof updation>>(entity, updation);

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            additionalData: {
                address: {
                    country: {
                        name: 'Shire',
                        capital: {
                            name: 'Bree',
                            population: 1000,
                            streets: ['Bag End', 'Bagshot Row'],
                        },
                        population: 3000,
                        city: {
                            name: 'Hobbiton',
                            population: 1000,
                            streets: [{
                                name: 'Bag End',
                                number: 1,
                            }, {
                                name: 'Bagshot Row',
                                number: 2,
                            }]
                        },
                    },
                    continent: {
                        name: 'Middle Earth',
                        population: 1000000,
                        cities: ['Minas Tirith', 'Rivendell', 'Hobbiton'],
                    },
                },
                enemies: ['Sauron', 'Morgoth', 'Azog'],
                appearance: 'Humanoid',
            }
        })
    });
});

describe('Path handlers', () => {
    it('Overrides field with path handler', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
        };
        const updation1 = {
            name: 'Aragorn',
        };
        const updation2 = {
            name: 'Gandalf',
        };

        const pathHandler = {
            'name': (source, updation) => {
                if (source === 'Frodo' && updation === 'Aragorn') {
                    return 'Fragorn';
                }
                return updation;
            }
        }

        const result1 = deepMergeObjects(target, updation1, pathHandler);
        const result2 = deepMergeObjects(target, updation2, pathHandler);

        expect(result1).toStrictEqual({
            name: 'Fragorn',
            surname: 'Baggins',
        })

        expect(result2).toStrictEqual({
            name: 'Gandalf',
            surname: 'Baggins',
        })
    });
    it('Uses path handler and does not continue to traverse deleted fields', () => {
        const target = {
            name: 'Frodo',
            deep: {
                field1: 'value',
                midField: {
                    subField1: 1,
                    midSubField: {
                        role: 'Ring bearer',
                        attributes: {
                            strength: 10,
                            dexterity: 10,
                            intelligence: 10,
                        },
                        age: 100,
                        friends: ['Aragorn', 'Gandalf'],
                    },
                    subField2: 2,
                },
                field2: 'value2',
            },
            surname: 'Baggins',
        };

        const updation = {
            deep: {
                midField: {
                    midSubField: {
                        role: 'Companion',
                    },
                },
            },
        } as any;

        const pathHandler = {
            'deep.midField.midSubField': (source, updation) => {
                if (updation.role === 'Companion') {
                    return {
                        role: 'Follower',
                        attributes: {
                            faith: 11,
                        },
                    };
                }
                return updation;
            }
        }

        const result = deepMergeObjects(target, updation, pathHandler);

        expect(result).toStrictEqual({
            name: 'Frodo',
            deep: {
                field1: 'value',
                midField: {
                    subField1: 1,
                    midSubField: {
                        role: 'Follower',
                        attributes: {
                            faith: 11,
                        },
                    },
                    subField2: 2,
                },
                field2: 'value2',
            },
            surname: 'Baggins',
        })
    });

    it('Uses handler for array indexes', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth', 'Azog'],
        };
        const updation = {
            enemies: [],
        };

        const result = deepMergeObjects(target, updation, {
            'enemies.1': (source, updation) => {
                return 'Morgoth the Great';
            }
        });

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth the Great', 'Azog'],
        })
    })
})

describe('Options', () => {
    it('Uses arrayMergeStrategy on array fields', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth', 'Azog'],
        };
        const updation = {
            enemies: ['Bolg', 'Torok', 'Gollum'],
        };

        const result = deepMergeObjects(target, updation, {}, { arrayMergeStrategy: 'replace' });

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Bolg', 'Torok', 'Gollum'],
        })
    });

    it('Uses arrayMergeStrategy top lever array', () => {
        const target = ['Sauron', 'Morgoth', 'Azog'];
        const updation = ['Bolg', 'Torok', 'Gollum'];

        const result = deepMergeObjects(target, updation, {}, { arrayMergeStrategy: 'replace' });

        expect(result).toStrictEqual(['Bolg', 'Torok', 'Gollum'])
    })

    it('Prefers handlers over arrayMergeStrategy', () => {
        const target = {
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Sauron', 'Morgoth', 'Azog'],
        };
        const updation = {
            enemies: ['Bolg', 'Torok', 'Gollum'],
        };

        const result = deepMergeObjects(target, updation, {
            'enemies': (source, updation) => {
                return ['Nazgul King', 'Nazgul Queen', 'Nazgul Prince'];
            }
        }, { arrayMergeStrategy: 'replace' });

        expect(result).toStrictEqual({
            name: 'Frodo',
            surname: 'Baggins',
            enemies: ['Nazgul King', 'Nazgul Queen', 'Nazgul Prince'],
        })
    })
})