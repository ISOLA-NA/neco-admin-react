import React, { useState, useEffect } from 'react'
import { useApi } from '../../../context/ApiContext'
import { PostType } from '../../../services/api.services'

interface SelectUserInPostProps {
  onMetaChange: (meta: { metaType1: string }) => void
  data?: {
    metaType1?: string
  }
  isDisable?: boolean
}

const SelectUserInPost: React.FC<SelectUserInPostProps> = ({
  onMetaChange,
  data,
  isDisable = false
}) => {
  const { getAllPostTypes } = useApi()
  const [postTypes, setPostTypes] = useState<PostType[]>([])
  const [selectedPostTypeId, setSelectedPostTypeId] = useState<string>(data?.metaType1 || '')

  useEffect(() => {
    const fetchPostTypes = async () => {
      try {
        const postTypesData = await getAllPostTypes()
        setPostTypes(postTypesData)
      } catch (error) {
        console.error('Error fetching post types:', error)
      }
    }

    fetchPostTypes()
  }, [getAllPostTypes])

  useEffect(() => {
    onMetaChange({ metaType1: selectedPostTypeId })
  }, [selectedPostTypeId, onMetaChange])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPostTypeId(e.target.value)
  }

  return (
    <div className="my-4">
      <label className="block font-medium mb-2">Select Post Types</label>
      <select
        value={selectedPostTypeId}
        onChange={handleChange}
        disabled={isDisable}
        className="w-full p-2 border rounded"
      >
        <option value="">-- Select a post type --</option>
        {postTypes.map(postType => (
          <option key={postType.ID} value={postType.ID}>
            {postType.Name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectUserInPost
