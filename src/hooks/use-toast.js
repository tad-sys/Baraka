import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 10000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

export function useToast() {
  const [state, setState] = React.useState({ toasts: [] })
  return {
    ...state,
    toast: (props) => console.log("Toast:", props),
    dismiss: (id) => console.log("Dismiss:", id),
  }
}