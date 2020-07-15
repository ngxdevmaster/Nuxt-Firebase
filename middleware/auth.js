export default async (context) => {
  const redirect = context.redirect
  const user = context.store.state.user.id
  const route = context.route

  if (!user && route.name != 'login') {
    redirect('/login')
    return
  } else {
    if (!user) return
  }
  return
}

function isAdminRoute(route) {
  if (route.matched.some((record) => record.path == '/user-management')) {
    return true
  }
}

function redirectingInF(route, redirect) {
  if (route.matched.some((record) => record.path == '/')) {
    redirect('/login')

    //  setTimeout(() => {
    //    redirect('/dashboard')
    //  }, 400);
  }
}
