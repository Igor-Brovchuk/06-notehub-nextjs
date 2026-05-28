import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NoteTag } from '../../type/note'
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from 'formik'
import { createNote, type CreateNoteParams } from '../../lib/api'
import toast from 'react-hot-toast'
import * as Yup from 'yup'
import css from './NoteForm.module.css'

interface NoteFormProps {
  onClose: () => void
}

const initialValues: CreateNoteParams = {
  title: '',
  content: '',
  tag: 'Work',
}

const tags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping']

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title is too long')
    .required('Title is required'),
  content: Yup.string().max(500, 'Content must be under 500 characters'),
  tag: Yup.string().oneOf(tags, 'Invalid tag').required('Tag is required'),
})

export default function NoteForm({ onClose }: NoteFormProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note created successfully!')
      onClose()
    },
    onError: () => {
      toast.error('Something went wrong')
    },
  })

  const handleSubmit = (
    values: CreateNoteParams,
    actions: FormikHelpers<CreateNoteParams>,
  ) => {
    mutate(values, {
      onSuccess: () => actions.resetForm(),
    })
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <Field id="title" name="title" className={css.input} />
          <ErrorMessage name="title" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="content">Content</label>
          <Field
            as="textarea"
            id="content"
            name="content"
            rows={8}
            className={css.textarea}
          />
          <ErrorMessage name="content" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="tag">Tag</label>
          <Field as="select" id="tag" name="tag" className={css.select}>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Field>
          <ErrorMessage name="tag" component="span" className={css.error} />
        </div>

        <div className={css.actions}>
          <button type="button" className={css.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={css.submitButton}
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create note'}
          </button>
        </div>
      </Form>
    </Formik>
  )
}
