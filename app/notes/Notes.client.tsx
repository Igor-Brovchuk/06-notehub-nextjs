'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchNotes } from '@/lib/api'
import NoteList from '@/components/NoteList/NoteList'
import Pagination from '@/components/Pagination/Pagination'
import css from '@/app/notes/Notes.module.css'
import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import NoteForm from '@/components/NoteForm/NoteForm'
import { useDebouncedCallback } from 'use-debounce'
import SearchBox from '@/components/SearchBox/SearchBox'

export default function App() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['notes', query, page],
    queryFn: () => fetchNotes({ query, page }),
    placeholderData: keepPreviousData,
  })

  const updateQuery = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      setPage(1)
    },
    1000,
  )

  const notes = data?.notes || []
  const totalPages = data?.totalPages ?? 1

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox onSearch={updateQuery} />
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
            />
          )}
          <button className={css.button} onClick={handleOpenModal}>
            Create note +
          </button>
        </header>

        <main>
          {isLoading && <p>Loading notes...</p>}

          {(isError || (isSuccess && notes.length === 0)) && (
            <p>Failed to load notes</p>
          )}

          {isSuccess && notes.length > 0 && (
            <NoteList notes={notes} onSelect={() => {}} />
          )}
        </main>
      </div>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm onClose={handleCloseModal} />
        </Modal>
      )}
    </>
  )
}
