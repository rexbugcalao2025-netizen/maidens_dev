import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

const notyf = new Notyf({
  duration: 3000,
  position: {
    x: 'right',
    y: 'top'
  },
  types: [
    {
      type: 'success',
      background: '#e85d8f', // rose
      icon: {
        className: 'bi bi-check-circle',
        tagName: 'i',
        color: '#fff'
      }
    },
    {
      type: 'error',
      background: '#9b7b8f', // muted rose
      icon: {
        className: 'bi bi-x-circle',
        tagName: 'i',
        color: '#fff'
      }
    }
  ]
})

export default notyf
