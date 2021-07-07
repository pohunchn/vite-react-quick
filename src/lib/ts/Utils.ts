import { useEffect, useState } from "react";

export const IS_DEV = process.env.NODE_ENV == "development"

class DataProxy<T> {
    // private proxy: any;
    constructor(state: any, _parent = null as unknown as DataNotify) {
        let dep = new DataNotify();
        const proxy = new Proxy(state, {
            get(target: any, prop, value) {

                if (DataNotify.target) {
                    dep.depend();
                }

                const res = Reflect.get(target, prop, value);

                return res;
            },
            set(target: any, prop, value, receiver) {
                const result = Reflect.set(target, prop, value, receiver);
                // trigger
                dep.notify();
                return result;
            }
        });
        proxy.update = () => {
            proxy.value = toRaw(proxy.value)
        }
        return proxy;
    }
    
}

class DataNotify {
    static globalId: number = 0;

    id: number;
    subs: DataWatch[];
    static target: DataWatch | null = null;

    constructor() {
        DataNotify.globalId++;
        this.id = DataNotify.globalId;
        this.subs = [];
    }

    addSub(sub: DataWatch) {
        this.subs.push(sub);
        if (this.subs.length >= 100) {
            console.warn("too many sublist");
        }
    }

    depend() {
        DataNotify.target!.addDep(this);
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }

    removeSub(sub: DataWatch) {
        let index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    }

}

class DataWatch {
    vm;
    expOrFn;
    getter;
    depIds: {[key: string]: DataNotify} = {};
    value;
    onChange: (data: any, val: any, oldVal: any) => void;

    constructor(
        vm: any,
        expOrFn: any,
        onChange: (data: any, val: any, oldVal: any) => void
    ) {
        this.vm = vm;
        this.expOrFn = expOrFn;
        this.onChange = onChange;
        this.depIds = {};
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = this.parseGetter(expOrFn.trim());
        }
        this.value = this.get();
    }

    update() {
        let value = this.get();
        let oldVal = this.value;
        this.value = value;
        this.onChange(this.vm, value, oldVal);
    }

    get() {
        DataNotify.target = this;
        let value = this.getter.call(this.vm, this.vm);
        DataNotify.target = null;
        return value;
    }

    parseGetter(exp: any) {
        if (/[^\w.$]/.test(exp)) return; 
        var exps = exp.split('.');
        return function(obj: any) {
            for (var i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        }
    }

    addDep(dep: DataNotify) {
        if (this.depIds[dep.id] === undefined) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }

    remove() {
        for (let depId in this.depIds) {
            let dep: DataNotify = this.depIds[depId];
            dep.removeSub(this);
        }
        this.depIds = {};
    }
}

export function createModel<T>(value: T) {
    return new DataProxy<T>({value : value}) as { value: T, update: ()=>{} };
}

export function useModel(value: { value: any }) {
    let [state, setState] = useState(value.value);
    useEffect(() => {
        let watcher = new DataWatch(value, '', () => {
            setState(() => state = value.value);
        })
        return () => {
            watcher.remove();
            value = null as any;
        };
    }, [])
}

export function toRaw<T>(val: T): T {
    if (typeof val === "object") {
        if (val === null) return val;
        else if (Array.isArray(val)) return cloneArr(val);
        else return cloneObj(val);
    } else return val;
}

function cloneObj<T>(object: T): T {
    let obj = {} as any;
    for (let key in object) {
        obj[key] = toRaw(object[key]);
    }
    return obj;
}

function cloneArr<T>(array: any[]): T {
    let arr = [];
    let length = array.length;
    for (let i = 0; i < length; i++) {
        arr.push(toRaw(array[i]));
    }
    return arr as unknown as T;
}