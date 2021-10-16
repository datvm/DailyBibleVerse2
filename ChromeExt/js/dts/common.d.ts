interface String {

    loc(): string;

}

interface ParentNode { 

    querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E | null;

}