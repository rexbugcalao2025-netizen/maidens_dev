import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

const notyf = new Notyf({
  duration: 4000,
  position: {
    x: 'right',
    y: 'top'
  },
  ripple: true,
  dismissible: true,
  types: [
    {
      type: 'success',
      background: '#e85d8f',
      icon: {
        className: 'bi bi-check-circle-fill',
        tagName: 'i'
      }
    },
    {
      type: 'error',
      background: '#dc3545',
      icon: {
        className: 'bi bi-x-circle-fill',
        tagName: 'i'
      }
    }
  ]
})

export default notyf
