import Draft from '../src/Draft';

export const mockSVGElement = document.createElement('svg');
export const getDraft       = (options) => new Draft(mockSVGElement, options);

afterEach(() => mockSVGElement.innerHTML = '');