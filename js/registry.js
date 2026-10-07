(function (root) {
  const DP = (root.DP = root.DP || {});
  DP.patterns = [];
  DP.logic = {};
  DP.demos = {}; // interactive demo mount functions, filled by patterns/*.demo.js
  DP.register = function (pattern) {
    DP.patterns.push(pattern);
  };
})(window);
