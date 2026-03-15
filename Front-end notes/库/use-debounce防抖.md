[`use-debounce`](https://www.npmjs.com/package/use-debounce) 

``` 
pnpm i use-debounce
```


导入一个函数，例如：

``` ts
import { useDebouncedCallback } from 'use-debounce';
 
const handleSearch = useDebouncedCallback((term) => {
  console.log(`Searching... ${term}`);
 
  const params = new URLSearchParams(searchParams);
  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }
  replace(`${pathname}?${params.toString()}`);
}, 300);
```