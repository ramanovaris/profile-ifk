import assert from "node:assert";

// Mock middleware logic
function testMiddleware({ pathname, cookie }) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const isLoginPage = cleanPath === "/admin/login";

  if (!cookie && !isLoginPage) {
    return { status: 307, redirect: "/admin/login" };
  }

  if (cookie && (isLoginPage || cleanPath === "/admin")) {
    return { status: 307, redirect: "/admin/dashboard" };
  }

  return { status: 200, redirect: null };
}

// 1. Unauthenticated visits
assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin", cookie: null }),
  { status: 307, redirect: "/admin/login" },
  "Unauthenticated accessing /admin must redirect to /admin/login"
);

assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin/", cookie: null }),
  { status: 307, redirect: "/admin/login" },
  "Unauthenticated accessing /admin/ must redirect to /admin/login"
);

assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin/dashboard", cookie: null }),
  { status: 307, redirect: "/admin/login" },
  "Unauthenticated accessing /admin/dashboard must redirect to /admin/login"
);

assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin/login", cookie: null }),
  { status: 200, redirect: null },
  "Unauthenticated accessing /admin/login must be allowed"
);

// 2. Authenticated visits
assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin", cookie: "token123" }),
  { status: 307, redirect: "/admin/dashboard" },
  "Authenticated accessing /admin must redirect to /admin/dashboard"
);

assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin/login", cookie: "token123" }),
  { status: 307, redirect: "/admin/dashboard" },
  "Authenticated accessing /admin/login must redirect to /admin/dashboard"
);

assert.deepStrictEqual(
  testMiddleware({ pathname: "/admin/dashboard", cookie: "token123" }),
  { status: 200, redirect: null },
  "Authenticated accessing /admin/dashboard must be allowed"
);

console.log("All 7 middleware assertion tests PASSED!");
