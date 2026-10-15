import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Avatar,
  StatusBadge,
  ProgressBar,
  Modal,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui'
import { Plus, Package } from 'lucide-react'

export function ComponentsTest() {
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-12">Composants TrackPro</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Boutons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Bouton primaire
                </Button>
                <Button variant="secondary" className="w-full">
                  Bouton secondaire
                </Button>
                <Button variant="danger" className="w-full">
                  Bouton danger
                </Button>
                <div className="flex gap-2">
                  <Button size="sm">Petit</Button>
                  <Button size="md">Moyen</Button>
                  <Button size="lg">Grand</Button>
                </div>
                <Button variant="primary" disabled className="w-full">
                  Désactivé
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Champs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input placeholder="Email" type="email" />
                <Input placeholder="Mot de passe" type="password" />
                <Input placeholder="Texte" />
                <Input placeholder="Désactivé" disabled />
              </div>
            </CardContent>
          </Card>

          {/* Avatars */}
          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap items-center">
                <Avatar initials="JD" color="primary" size="lg" />
                <Avatar initials="AB" color="secondary" size="lg" />
                <Avatar initials="CD" color="success" size="lg" />
                <Avatar initials="EF" color="warning" size="lg" />
                <Avatar initials="GH" color="primary" size="md" />
                <Avatar initials="IJ" color="primary" size="sm" />
              </div>
            </CardContent>
          </Card>

          {/* Status Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges de statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatusBadge status="deposee" />
                <StatusBadge status="en_cours" />
                <StatusBadge status="non_deposee" />
              </div>
            </CardContent>
          </Card>

          {/* Progress Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Barres de progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-2">Succès (100%)</p>
                  <ProgressBar value={100} color="success" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-2">Secondaire (67%)</p>
                  <ProgressBar value={67} color="secondary" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-2">Primaire (50%)</p>
                  <ProgressBar value={50} color="primary" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-2">Avertissement (25%)</p>
                  <ProgressBar value={25} color="warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modals & Dialogs */}
          <Card>
            <CardHeader>
              <CardTitle>Modals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowModal(true)}
                >
                  Ouvrir modal
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowConfirm(true)}
                >
                  Ouvrir confirmation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>État vide</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Package className="w-12 h-12" />}
                title="Aucune pièce trouvée"
                description="Ajoutez votre première pièce pour commencer le suivi."
                action={
                  <Button size="sm" variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une pièce
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modal de test"
      >
        <p className="text-[var(--foreground)] mb-4">
          Ceci est un contenu de modal de test.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Confirmer
          </Button>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirmer l'action"
        message="Êtes-vous sûr de vouloir procéder?"
        onConfirm={() => setShowConfirm(false)}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  )
}
