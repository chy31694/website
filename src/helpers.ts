import Vue from 'vue';
import { TYPE } from 'vue-toastification';
import { AxiosError } from 'axios';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const reURL = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

export function formatDescription(s: string) {
    s = s.trim().replace(/\n/g, '<br>');
    s = s.replace(reURL, (substring) => {
        let href = substring;
        if (!href.startsWith('http')) {
            href = `//${href}`;
        }
        return `<a href="${href}" target="_blank">${substring}</a>`;
    });
    return s;
}

export function isPromise(val: any): val is Promise<any> {
    return !!val && typeof val === 'object' && typeof val.then === 'function' && typeof val.catch === 'function';
}

export function deepCopy<T>(a: T): T {
    return JSON.parse(JSON.stringify(a));
}

export function isAxiosError(err: any): err is AxiosError {
    return err instanceof Error && (err as AxiosError).isAxiosError === true;
}

type TOnHttpError<T = any> = (this: T, err: AxiosError) => boolean | void;

export function SGuard<T extends Vue>(options?: {
    onHttpError?: TOnHttpError<T>;
}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const fn = <Function>descriptor.value;

        descriptor.value = async function(this: Vue, ...args: any[]) {
            const l = this.$loading.show({
            });
            let fnResult: any;
            try {
                fnResult = fn.apply(this, args);
                if (isPromise(fnResult)) {
                    fnResult = await fnResult;
                }
                return fnResult;
            }
            catch (err) {
                let msg: string[] = [];

                if (isAxiosError(err) && err.response) {
                    if (options?.onHttpError && options?.onHttpError.call(this as any, err) === true) {
                        // supress
                    }
                    else {
                        msg.push(`[${err.response.status}] ${err.response.statusText}`)

                        if (typeof err.response.data === 'object') {
                            msg.push(err.response.data.message);
                        }
                    }
                }
                else {
                    console.error(err);
                    msg = ['Oops, something went wrong.', err?.message ?? ''];
                }

                if (msg.length) {
                    this.$toast(msg.join('\n'), {
                        type: TYPE.ERROR,
                        timeout: false,
                        closeOnClick: false,
                    });
                }
            }
            finally {
                l.hide();
            }
        };
    };
}

export function stringifyQueryParams(o: any) {
    return Object.fromEntries(Object.entries(o).filter(x => x[1] !== null && x[1] !== void 0).map<[string, string]>(x => [ x[0], String(x[1]) ]));
}
