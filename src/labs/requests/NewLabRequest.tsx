import { Typeahead, Label, Button, Alert, Dropdown } from '@hospitalrun/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useAddBreadcrumbs from '../../page-header/breadcrumbs/useAddBreadcrumbs'
import useTitle from '../../page-header/title/useTitle'
import { fetchPatientAppointments } from '../../scheduling/appointments/appointments-slice'
import TextFieldWithLabelFormGroup from '../../shared/components/input/TextFieldWithLabelFormGroup'
import TextInputWithLabelFormGroup from '../../shared/components/input/TextInputWithLabelFormGroup'
import PatientRepository from '../../shared/db/PatientRepository'
import Appointment from '../../shared/model/Appointment'
import Lab from '../../shared/model/Lab'
import Patient from '../../shared/model/Patient'
import { RootState } from '../../shared/store'
import { requestLab } from '../lab-slice'

const NewLabRequest = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useHistory()
  useTitle(t('labs.requests.new'))
  const { status, error } = useSelector((state: RootState) => state.lab)
  const { appointments } = useSelector((state: RootState) => state.appointments)

  const [newLabRequest, setNewLabRequest] = useState({
    patient: '',
    appointment: '',
    type: '',
    notes: '',
    status: 'requested',
  })

  const [showAppointments, setShowAppointments] = useState<boolean>(false)

  const breadcrumbs = [
    {
      i18nKey: 'labs.requests.new',
      location: `/labs/new`,
    },
  ]
  useAddBreadcrumbs(breadcrumbs)

  const onPatientChange = (patient: Patient) => {
    if (!showAppointments) {
      setNewLabRequest((previousNewLabRequest) => ({
        ...previousNewLabRequest,
        patient: patient.id,
      }))
      dispatch(fetchPatientAppointments(patient.id))
      setShowAppointments(true)
    } else {
      setNewLabRequest((previousNewLabRequest) => ({
        ...previousNewLabRequest,
        patient: '',
      }))
      setShowAppointments(false)
    }
  }

  const onAppointmentChange = (appointment: Appointment) => {
    setNewLabRequest((previousNewLabRequest) => ({
      ...previousNewLabRequest,
      appointment: new Date(appointment.startDateTime).toLocaleString(),
    }))
  }

  const onLabTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const type = event.currentTarget.value
    setNewLabRequest((previousNewLabRequest) => ({
      ...previousNewLabRequest,
      type,
    }))
  }

  const onNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const notes = event.currentTarget.value
    setNewLabRequest((previousNewLabRequest) => ({
      ...previousNewLabRequest,
      notes,
    }))
  }

  const onSave = async () => {
    const newLab = (newLabRequest as unknown) as Lab
    const onSuccess = (createdLab: Lab) => {
      history.push(`/labs/${createdLab.id}`)
    }

    dispatch(requestLab(newLab, onSuccess))
  }

  const onCancel = () => {
    history.push('/labs')
  }

  function formatAppointment(arr: Appointment) {
    return {
      onClick: () => onAppointmentChange(arr),
      text: new Date(arr.startDateTime).toLocaleString(),
    }
  }

  const formattedAppointmentList: { onClick: () => void; text: string }[] = []
  appointments.map((a) => formattedAppointmentList.push(formatAppointment(a)))

  const dropdown = (
    <Dropdown
      direction="down"
      id="dropdown8273"
      items={formattedAppointmentList}
      size="sm"
      text={newLabRequest.appointment === '' ? 'Appointments' : newLabRequest.appointment}
      variant="light"
    />
  )

  return (
    <>
      {status === 'error' && (
        <Alert color="danger" title={t('states.error')} message={t(error.message || '')} />
      )}
      <form>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="form-group patient-typeahead">
                <Label htmlFor="patientTypeahead" isRequired text={t('labs.lab.patient')} />
                <Typeahead
                  id="patientTypeahead"
                  placeholder={t('labs.lab.patient')}
                  onChange={(p: Patient[]) => onPatientChange(p[0])}
                  onSearch={async (query: string) => PatientRepository.search(query)}
                  searchAccessor="fullName"
                  renderMenuItemChildren={(p: Patient) => <div>{`${p.fullName} (${p.code})`}</div>}
                  isInvalid={!!error.patient}
                />
              </div>
            </div>
            <div className="col">{showAppointments ? dropdown : ''}</div>
          </div>
        </div>
        <TextInputWithLabelFormGroup
          name="labType"
          label={t('labs.lab.type')}
          isRequired
          isEditable
          isInvalid={!!error.type}
          feedback={t(error.type as string)}
          value={newLabRequest.type}
          onChange={onLabTypeChange}
        />
        <div className="form-group">
          <TextFieldWithLabelFormGroup
            name="labNotes"
            label={t('labs.lab.notes')}
            isEditable
            value={newLabRequest.notes}
            onChange={onNoteChange}
          />
        </div>
        <div className="row float-right">
          <div className="btn-group btn-group-lg mt-3">
            <Button className="mr-2" color="success" onClick={onSave}>
              {t('actions.save')}
            </Button>
            <Button color="danger" onClick={onCancel}>
              {t('actions.cancel')}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

export default NewLabRequest
