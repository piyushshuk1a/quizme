// The type for the route config for each page of the app
type RouteConfigItem = {
  /**
   * The path for the route
   */
  path: string;

  /**
   * The page to be rendered for the given route
   */
  element: JSX.Element;

  /**
   * Denotes whether the route is guarded or not
   * @note Guarded route is rendered after validating login state, access level & tenant
   */
  isGuarded: boolean;
};
