import React, { useState } from 'react';
import TemplateFormModal from './TemplateFormModal'; // this path is correct if both files are in 'components'

const CreateTemplatePage = () => {
  const [showModal, setShowModal] = useState(true);

  const handleSave = (templateData) => {
    console.log('✅ Template saved!', templateData);
    setShowModal(false);
  };

  return (
    <div>
      <h2>Create New Template</h2>

      <TemplateFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        template={null}
        mode="create"
      />
    </div>
  );
};

export default CreateTemplatePage;
