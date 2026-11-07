import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

beforeEach(() => {
  localStorage.clear()
})

describe('Land Sourcing portal', () => {
  it('shows the role-based preview login', () => {
    render(<MemoryRouter><App/></MemoryRouter>)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your Kennix land sourcing workspace.')).toBeInTheDocument()
    expect(screen.getByText('Neha Sharma')).toBeInTheDocument()
    expect(screen.getByText('Vikram Bedi')).toBeInTheDocument()
  })

  it('filters assignments from a dashboard status link', () => {
    localStorage.setItem('kennix.land-sourcing.user.v1', 'ls-neha')
    render(<MemoryRouter initialEntries={['/requirements?status=New']}><App/></MemoryRouter>)

    expect(screen.getByRole('combobox', { name: 'Assignment status' })).toHaveValue('New')
    expect(screen.getByText('Neha Kapoor')).toBeInTheDocument()
    expect(screen.getByText('Kunal Sood')).toBeInTheDocument()
    expect(screen.queryByText('Jayant Kumar')).not.toBeInTheDocument()
  })
})
