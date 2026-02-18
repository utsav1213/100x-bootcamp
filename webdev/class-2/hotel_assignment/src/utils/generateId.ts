import { nanoid } from 'nanoid'
export const generateId = (prefix: string) => {
     return `${prefix}_${nanoid(10)}`
}
