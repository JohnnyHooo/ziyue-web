// 紫月 IP 球(OrbKit)· WebGL 还原,用于官网 hero。
// 源自 App 内 ai-orb.html 原型,改为【透明底·预乘 alpha】输出,让球浮在页面纸色底上;去掉调试滑块,参数固定。
// 用法:页面放 <canvas id="orb" class="orb"></canvas> + <script src="/orb.js" defer></script>
(function () {
  var cv = document.getElementById('orb');
  if (!cv) return;
  var gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return; // 不支持 WebGL 就静默留空

  var VERT = 'attribute vec2 aPos; void main(){ gl_Position=vec4(aPos,0.0,1.0); }';

  var FRAG = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;',
    'uniform float uRadius; uniform float uSpeed;',
    'uniform float uPCount; uniform float uPSpeed; uniform float uPHeight; uniform float uPSize; uniform float uPGlow; uniform float uPSpread;',
    'float crescent(vec2 uv, float rot, float rA, float rB, float off, float soft){',
    '  float c=cos(rot), s=sin(rot);',
    '  vec2 p=vec2(uv.x*c - uv.y*s, uv.x*s + uv.y*c);',
    '  float a=1.0-smoothstep(rA-soft, rA+soft, length(p));',
    '  float b=1.0-smoothstep(rB-soft, rB+soft, length(p - vec2(0.0, off)));',
    '  return clamp(a-b, 0.0, 1.0);',
    '}',
    'float h11(float n){ return fract(sin(n*127.1)*43758.5453); }',
    'float swirl(float phase, float seed){',
    '  float w = uSpeed*uTime;',
    '  return phase + 0.85*sin(w*0.55 + seed) + 0.55*sin(w*0.92 + seed*1.7) + 0.40*sin(w*1.50 + seed*2.3);',
    '}',
    'float ov(float seed){ float w = uSpeed*uTime; return 0.12*sin(w*0.80 + seed) + 0.07*sin(w*1.30 + seed*1.5); }',
    'float pul(float seed){ float w = uSpeed*uTime; return 0.55 + 0.45*sin(w*0.70 + seed)*sin(w*1.15 + seed*1.9); }',
    'float wavyBlob(vec2 p, float t, float baseR){',
    '  float ang = atan(p.y, p.x);',
    '  float r = baseR + 0.14*sin(ang*3.0 + t) + 0.10*sin(ang*5.0 - t*0.8 + 1.0) + 0.07*sin(ang*2.0 + t*1.4 + 2.0);',
    '  return 1.0 - smoothstep(r - 0.03, r + 0.18, length(p));',
    '}',
    'void main(){',
    '  vec2 uv=(gl_FragCoord.xy*2.0 - uRes)/min(uRes.x,uRes.y);',
    '  uv -= uMouse*0.10;',
    '  float R=uRadius;',
    '  float d=length(uv);',
    '  float ball=smoothstep(R, R*0.985, d);',
    '  vec2 s=uv/R;',
    '  vec2 sm=vec2(s.x, -s.y);',
    '  float ds=length(s);',
    '  float z=sqrt(max(0.0, 1.0-ds*ds));',
    '  float tb=clamp(0.5 + 0.5*sm.y, 0.0, 1.0);',
    '  vec3 cTop=vec3(0.357,0.212,0.722); vec3 cMid=vec3(0.541,0.361,0.941); vec3 cBot=vec3(0.776,0.659,1.000);',
    '  vec3 base=mix(cTop, cMid, smoothstep(0.0,0.55,tb));',
    '  base=mix(base, cBot, smoothstep(0.5,1.0,tb));',
    '  vec3 milky=vec3(0.941,0.902,1.0);',
    '  float bg2=0.0;',
    '  bg2 += crescent(sm, swirl(0.0, 0.0)+3.14159, 0.94,1.231,0.583+ov(1.0),0.52)*0.85;',
    '  bg2 += crescent(sm, swirl(2.1, 1.3)+3.14159, 0.90,1.179,0.558+ov(2.1),0.44)*0.55;',
    '  bg2 *= mix(0.82,1.0,z);',
    '  base=mix(base, milky, clamp(bg2,0.0,1.0)*0.55);',
    '  float gW=0.0, gM=0.0;',
    '  gW += wavyBlob(sm - vec2(ov(7.0)*1.6, 0.30 + ov(8.0)),  uSpeed*uTime*1.4, 0.32) * 0.15 * pul(0.7);',
    '  gW += wavyBlob(sm - vec2(ov(9.0)*1.6, -0.24 + ov(10.0)), uSpeed*uTime*0.9, 0.24) * 0.11 * pul(2.3);',
    '  gM += crescent(sm, swirl(3.0, 4.7), 0.84,1.10, 0.52+ov(5.1),0.48)*0.45*pul(4.1);',
    '  gM += crescent(sm, swirl(5.3, 5.5), 0.84,1.10, 0.52+ov(6.3),0.44)*0.40*pul(5.7);',
    '  float zw=mix(0.80,1.0,z);',
    '  base += vec3(1.0)*(gW*zw);',
    '  base += milky*(gM*zw);',
    '  base += milky*(1.0 - smoothstep(0.0,0.9,ds))*0.38;',
    '  float ringFall=0.35 + 0.65*clamp(0.5 + 0.5*sm.y, 0.0, 1.0);',
    '  float ar=abs(ds-1.0);',
    '  float ring=(1.0-smoothstep(0.0,0.34,ar))*0.45 + (1.0-smoothstep(0.0,0.16,ar))*0.30 + (1.0-smoothstep(0.0,0.06,ar))*0.22;',
    '  float ringGate=1.0 - smoothstep(0.88,1.04,ds);',
    '  base += vec3(1.0)*ring*ringFall*ringGate;',
    '  base = clamp(base, 0.0, 1.0);',
    '  float fres=smoothstep(0.80,1.0,ds);',
    '  base += milky*fres*0.28;',
    '  float wt=uSpeed*uTime;',
    '  for(int i=0;i<7;i++){',
    '    float fi=float(i);',
    '    vec2 fp=(vec2(h11(fi+11.0), h11(fi+21.0))-0.5)*1.5 + vec2(sin(wt*0.6+fi), cos(wt*0.5+fi*1.7))*0.13;',
    '    float tw=pow(0.5+0.5*sin(wt*(2.5+fi*0.6) + fi*2.7), 4.0);',
    '    base += milky * (1.0-smoothstep(0.0,0.05,length(sm-fp))) * tw * 0.55 * z;',
    '  }',
    '  float spec=1.0-smoothstep(0.0,0.42,length(sm-vec2(-0.28,-0.34)));',
    '  base += vec3(1.0)*pow(spec,1.6)*0.40;',
    '  float sparks=0.0;',
    '  for(int i=0;i<16;i++){',
    '    float fi=float(i);',
    '    float vis=step(fi, uPCount-0.5);',
    '    float sx=(h11(fi+1.0)-0.5)*uPSpread;',
    '    float spd=(0.06 + h11(fi+2.0)*0.08)*uPSpeed;',
    '    float ph=h11(fi+3.0);',
    '    float life=fract(uTime*spd + ph);',
    '    float py=-0.42 + life*uPHeight;',
    '    float px=sx + sin(uTime*0.5 + fi)*0.06;',
    '    vec2 sp=uv - vec2(px, py);',
    '    float sz=(0.005 + h11(fi+4.0)*0.008)*uPSize;',
    '    sparks += (1.0-smoothstep(0.0, sz, length(sp))) * sin(life*3.14159) * vis;',
    '  }',
    '  float sparkA = sparks*uPGlow;',
    // 透明合成(预乘 alpha):球本体(ball)+ 上升粒子(milky);不要球外光晕
    '  vec3 orb = clamp(base, 0.0, 1.0);',
    '  vec3 preCol = orb*ball + milky*sparkA;',
    '  float A = clamp(ball + sparkA, 0.0, 1.0);',
    '  gl_FragColor = vec4(preCol, A);',
    '}'
  ].join('\n');

  function mk(t, src) {
    var sh = gl.createShader(t); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); }
    return sh;
  }
  var pr = gl.createProgram();
  gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT));
  gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(pr); gl.useProgram(pr);

  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var ap = gl.getAttribLocation(pr, 'aPos');
  gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0, 0, 0, 0);

  var U = function (n) { return gl.getUniformLocation(pr, n); };
  var uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uRadius = U('uRadius'), uSpeed = U('uSpeed');
  var uPCount = U('uPCount'), uPSpeed = U('uPSpeed'), uPHeight = U('uPHeight'), uPSize = U('uPSize'), uPGlow = U('uPGlow'), uPSpread = U('uPSpread');

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth || 300, h = cv.clientHeight || 330;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  window.addEventListener('resize', resize); resize();

  var tmx = 0, tmy = 0, mx = 0, my = 0;
  window.addEventListener('mousemove', function (e) {
    var r = cv.getBoundingClientRect();
    tmx = Math.max(-1, Math.min(1, ((e.clientX - (r.left + r.width / 2)) / r.width) * 2));
    tmy = Math.max(-1, Math.min(1, -(((e.clientY - (r.top + r.height / 2)) / r.height) * 2)));
  }, { passive: true });

  var t0 = performance.now();
  function frame(now) {
    var time = (now - t0) / 1000;
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, mx, my); gl.uniform1f(uRadius, 0.6); gl.uniform1f(uSpeed, 0.5);
    gl.uniform1f(uPCount, 9); gl.uniform1f(uPSpeed, 1.0); gl.uniform1f(uPHeight, 1.3);
    gl.uniform1f(uPSize, 1.0); gl.uniform1f(uPGlow, 0.6); gl.uniform1f(uPSpread, 1.3);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
