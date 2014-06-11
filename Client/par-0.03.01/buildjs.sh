#emcc -Dhtml -O1 -g2 -s ASSERTIONS=2 -s NO_EXIT_RUNTIME=1 --llvm-lto 3 --llvm-opts "['-vectorize-loops', '-enable-unsafe-fp-math', '-enable-fp-mad']" par.c -o par.js
#emcc -Dhtml -O3 -s NO_EXIT_RUNTIME=1 --llvm-lto 3 --llvm-opts "['-vectorize-loops', '-enable-unsafe-fp-math', '-enable-fp-mad']" /home/inferno/.dev/emscripten/system/lib/dlmalloc.c par.c -o par.js
emcc -Dhtml -O3 -s NO_EXIT_RUNTIME=1 --llvm-lto 3 --llvm-opts "['-vectorize-loops', '-enable-unsafe-fp-math', '-enable-fp-mad']" dlmalloc.c -o dlmalloc.js

