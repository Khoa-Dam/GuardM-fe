import React from "react";



export default function LobbyLayout({ children }: React.PropsWithChildren) {
  return (
    // Break out of root container and disable scroll-smooth (conflicts with Lenis)
    <div style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw', maxWidth: 'none', scrollBehavior: 'auto' }}>
      {children}
    </div>
  );
}
