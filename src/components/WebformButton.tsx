import React from 'react'

const WebformButton: React.FC<any> = ({ children, ...props }) => <button {...props}>{children}</button>

export default WebformButton
