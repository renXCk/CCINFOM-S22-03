import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          CoreUI
        </a>
        <span className="ms-1">&copy; Delivery Shipment.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Group 3</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CCINFOM-S22; Database Application
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
