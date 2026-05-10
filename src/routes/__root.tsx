import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";

// NotFoundComponent: जब कोई पेज न मिले
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-yellow-500">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-gray-400">ZabPlay: यह रास्ता खाली है!</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ZabPlay - Indian Media Player" },
      { name: "description", content: "ZabPlay Gallery: Premium Experience" },
    ],
  }),
  // हमने 'shellComponent' हटा दिया है क्योंकि वही लाल स्क्रीन ला रहा था
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Scripts />
    </>
  );
}
