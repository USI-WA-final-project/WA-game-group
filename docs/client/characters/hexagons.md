# Drawing a cell (hexagon)

Radius: 16

Box: 32x32

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M 0 16 L 8 30 L 24 30 L 32 16 L 24 2 L 8 2 L 0 16" fill="#000000"/>
</svg>


### Indices

#### Faces
```
        1
     ________  
  0 /        \ 2
   /          \
   \          /
  5 \________/ 3
         4
```

#### Vertex
```
   0 ________ 1
    /        \
   /          \ 2
 5 \          /
    \________/
    4        3
```


## Vertex 0

Absolute: `M 8 2 L 0 16 L 8 30 L 24 30 L 32 16 L 24 2 L 8 2`

Relative: `M 8 2 l -8 14 l 8 14 l 16 0 l 8 -14 l -8 -14 l -16 0`

## Vertex 1

Absolute: `M 24 2 L 8 2 L 0 16 L 8 30 L 24 30 L 32 16 L 24 2`

Relative: `M 24 2 l -16 0 l -8 14 l 8 14 l 16 0 l 8 -14 l -8 -14`

## Vertex 2

Absolute: `M 32 16 L 24 2 L 8 2 L 0 16 L 8 30 L 24 30 L 32 16`

Relative: `M 32 16 l -8 -14 l -16 0 l -8 14 l 8 14 l 16 0 l 8 -14`

## Vertex 3

Absolute: `M 24 30 L 32 16 L 24 2 L 8 2 L 0 16 L 8 30 L 24 30`

Relative: `M 24 30 l 8 -14 l -8 -14 l -16 0 l -8 14 l 8 14 l 16 0`

## Vertex 4

Absolute: `M 8 30 L 24 30 L 32 16 L 24 2 L 8 2 L 0 16 L 8 30`

Relative: `M 8 30 l 16 0 l 8 -14 l -8 -14 l -16 0 l -8 14 l 8 14`

## Vertex 5

Absolute: `M 0 16 L 8 30 L 24 30 L 32 16 L 24 2 L 8 2 L 0 16`

Relative: `M 0 16 l 8 14 l 16 0 l 8 -14 l -8 -14 l -16 0 l -8 14`
